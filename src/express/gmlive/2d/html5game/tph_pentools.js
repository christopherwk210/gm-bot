/// (name)
function js_check(name) {
	return window[name] ? 1 : 0;
}
/// js_call(...args):
function js_call(name) {
	var f = window[name];
	if (f) {
		return f.apply(this, Array.prototype.slice.call(arguments, 1));
	} else return undefined;
}
///
function js_get(name) {
	return window[name];
}
///
function js_set(name, value) {
	window[name] = value;
}

function gml$setctx(_self, _other) {
	if (_self) window["gml$self"] = _self;
	if (_other) window["gml$other"] = _other;
}

function gml$op(a, o, b) {
	switch (o) {
		case 0x00: return a * b;
		case 0x01: return a / b;
		case 0x02: return a % b;
		case 0x03: return (a / b) | 0;
		case 0x10: return a + b;
		case 0x11: return a - b;
		case 0x20: return a << b;
		case 0x21: return a >> b;
		case 0x30: return a | b;
		case 0x31: return a & b;
		case 0x32: return a ^ b;
		case 0x40: return (a == b) | 0;
		case 0x41: return (a != b) | 0;
		case 0x42: return (a < b) | 0;
		case 0x43: return (a <= b) | 0;
		case 0x44: return (a > b) | 0;
		case 0x45: return (a >= b) | 0;
		case 0x50: return (a && b) | 0;
		case 0x60: return (a || b) | 0;
		default: return a;
	}
}

window.gml$asset_kind = Object.create(null);
window.gml$asset_index = Object.create(null);
window.gml$asset_ac = [];
///:
function mark_asset(name, kind, index) {
	window.gml$asset_kind[name] = "asset." + kind;
	window.gml$asset_index[name] = index;
	window.gml$asset_ac.push({
		name: name,
		value: name,
		score: 0,
		meta: kind
	});
	return 1;
}
///: func(...);
function mark_fun(name, expr) { }
///: mark_get("_", v);
function mark_get(name, expr) { }
///: mark_set("_"); v = _;
function mark_set(name) { }
///: mark_wget("_", v[_]);
function mark_wget(name, expr) { }
///: mark_wset("_"); v[_] = _;
function mark_wset(name) { }
///: mark_qget("_", q.v);
function mark_qget(name, expr) { }
///: mark_qset("_"); q.v = _;
function mark_qset(name) { }
///: mark_qwget("_", q.v[_]);
function mark_qwget(name, expr) { }
///: mark_qwset("_"); q.v[_] = _;
function mark_qwset(name) { }
///: mark_val("_", v);
function mark_val(name, expr) { }
///:
function mark_init() {
	var js = window.gml_Script_gmcallback_ndce.toString();
	var inst = /function\s+\w+\(\s*(\w+)/g .exec(js)[1];
	var key = /(\w+)\s*=\s*js_call\(\s*"__ndce_index__"\s*\);/g .exec(js)[1];
	var val = /(\w+)\s*=\s*js_call\(\s*"__ndce_value__"\s*\);/g .exec(js)[1];
	var found = [];
	// fnjs(function(a, b) { ... }) -> 
	function fnjs(f) {
		var js = f.toString();
		var s = /function\s*\w*\s*\(([^)]*)\)/g.exec(js)[1].trim();
		var r = s ? s.split(/\s*,\s*/g) : [];
		for (var i = 0; i < r.length; i++) r[i] = r[i].trim();
		r.unshift(js.substring(js.indexOf("{") + 1, js.lastIndexOf("}")));
		return r;
	};
	// allow JS object instances:
	window.gml$inst = (function() {
		var f = window[/js_call\(\s*"__ndce_inst__"\s*\);\s*(\w+)\(/g .exec(js)[1]].toString();
		var c = f.substring(f.indexOf("{") + 1, f.lastIndexOf("}"));
		var v = /function\s+\w+\s*\(\s*(\w+)/g.exec(f)[1];
		return new Function(v, "if (" + v + " instanceof Object) return " + v + ";\n" + c);
	})();
	// with() construct, what a trouble:
	window.gml$withFunc = (function() {
		var s = window.gml_Script_gmcallback_ndce_with.toString();
		// remove linebreaks+indents (for now):
		s = s.replace(/[\r\n]+\s*/g, "");
		// grab the interesting part:
		s = /__with0__"\s*\);(.+?)js_call\(\s*"__with3__/g .exec(s)[1];
		// unwrap `{code};` -> `code`:
		s = s.replace(/^\s*\{\s*(.+?)\s*\}\s*;?\s*$/g, function(_, x) { return x });
		// index locals:
		var v = [];
		s.replace(/var (\w+)/g, function(m, s) {
			v.push(new RegExp(s, "g"));
			return m;
		});
		// patch locals:
		for (var k = 0; k < v.length; k++) s = s.replace(v[k], "__var" + (k + 1) + "__");
		// patch iterable:
		s = s.replace(/js_call\(\s*"__with1__"\s*\)/g, "__iter__");
		// find context, patch action:
		var v_self;
		s = s.replace(/js_call\(\s*"__with2__"\s*,\s*(\w+)\.\w+\s*\);?/g, function(_, v) {
			v_self = v; return "__action__;";
		});
		// patch context:
		s = s.replace(new RegExp(v_self, "g"), "__self__");
		// unwrap action:
		s = s.replace(/\{\s*__action__;\s*\}/g, "__action__;");
		// add linebreaks:
		s = s.replace(/(\{|\};?|;)\s*/g, function(_, s) { return s + "\n"; });
		s = s.replace(/\n$/g, "");
		// add indent:
		s = s.replace(/\{(.*(?:[\r\n]+.*)*?)(\s*\})/g, function(_, x, t) {
			return "{" + x.replace(/\n/g, "\n\t") + t;
		});
		// cleanup:
		s = s.replace(/(for|if)\(/g, function(_, x) { return x + " ("; });
		s = s.replace(/\)(\w)/g, function(_, x) { return ") " + x; });
		s = s.replace(/\)\{/g, ") {");
		s = s.replace(/(\w)=(\w)/g, function(_, a, b) { return a + " = " + b; });
		//
		return function(i, t, tx, iter, action) {
			var v = "gml$with" + i;
			return s
				.replace(/__var1__/g, v + "_1")
				.replace(/__var2__/g, v + "_2")
				.replace(/__var3__/g, v + "_3")
				.replace(/__self__/g, "gml$self" + i)
				.replace(/__iter__/g, iter)
				.replace(/__action__/g, action)
				.replace(/\t/g, tx)
				.replace(/\n/g, "\n" + t)
				.replace(/\};/g, "}");
		};
	})();
	//
	js.replace(/mark_fun\(\s*"([^"]+)",\s*(\w+)/g, function(r, q, o) {
		var k = "gml$" + q; found.push(k);
		window[k] = window[o];
		return r;
	});
	//
	var getCode = Object.create(null);
	js.replace(/mark_get\(\s*"(\w+)",\s*(.+?)\s*\);/g, function(r, name, expr) {
		var k = "get$" + name; found.push(k);
		getCode[name] = expr;
		window[k] = new Function("return " + expr + ";");
		return r;
	});
	js.replace(/mark_wget\(\s*"(\w+)",\s*(.+?)\s*\);/g, function(r, name, expr) {
		var k = "get$" + name; found.push(k);
		getCode[name] = expr;
		window[k] = new Function(key, "return " + expr + ";");
		return r;
	});
	js.replace(/mark_qget\(\s*"(\w+)",\s*(.+?)\s*\);/g, function(r, name, expr) {
		var k = "get$" + name; found.push(k);
		getCode[name] = expr;
		window[k] = new Function(inst, "return " + expr + ";");
		return r;
	});
	//
	js.replace(/mark_set\(\s*"(\w+)"\s*\);\s*(.+?;)/g, function(r, name, expr) {
		var k = "set$" + name; found.push(k);
		window[k] = new Function(val, expr);
		k = "aop$" + name; found.push(k);
		window[k] = new Function("__op__", val,
			val + " = gml$op(" + getCode[name] + ", __op__, " + val + "); "
			+ expr + "; return " + val + ";"
		);
		return r;
	});
	js.replace(/mark_wset\(\s*"(\w+)"\s*\);\s*(.+?;)/g, function(r, name, expr) {
		var k = "set$" + name; found.push(k);
		window[k] = new Function(key, val, expr);
		k = "aop$" + name; found.push(k);
		window[k] = new Function(key, "__op__", val,
			val + " = gml$op(" + getCode[name] + ", __op__, " + val + "); "
			+ expr + "; return " + val + ";"
		);
		return r;
	});
	js.replace(/mark_qset\(\s*"(\w+)"\s*\);\s*(.+?;)/g, function(r, name, expr) {
		var k = "set$" + name; found.push(k);
		window[k] = new Function(inst, val, expr);
		k = "aop$" + name; found.push(k);
		window[k] = new Function(inst, "__op__", val,
			val + " = gml$op(" + getCode[name] + ", __op__, " + val + "); "
			+ expr + "; return " + val + ";"
		);
		return r;
	});
	//
	var vconst = { };
	js.replace(/mark_val\(\s*"(\w+)",\s*(.+?)\);/g, function(r, name, expr) {
		var value;
		if (expr.charAt(0) == '"') {
			value = expr;
		} else value = parseFloat(expr);
		vconst[name] = value;
		var k = "gml$" + name; found.push(k);
		window[k] = value;
		return r;
	});
	window.gml$constVal = vconst;
	//
	window.gml$trace = window.gml$trace_js;
	window.gml$show_debug_message = window.gml$trace_js;
	// Wrap URL resolver function to support Data URLs:
	(function() {
		var p0 = "\\s*\\(\\s*";
		var p1 = "\\s*\\)\\s*";
		var eq = "\\s*=\\s*";
		var id = "\\w+";
		//
		var sprite_add_js = window.gml$sprite_add.toString();
		var sprite_add_url = /function\s*\w*\s*\((\w+)/g.exec(sprite_add_js)[1];
		var sprite_add_url2 = new RegExp(
			"("+id+")"+eq+sprite_add_url+"\\b", // `sprite_add_url2 = sprite_add_url`
		"g").exec(sprite_add_js);
		sprite_add_url2 = sprite_add_url2 ? sprite_add_url2[1] : sprite_add_url;
		//
		var image_add_js = window[new RegExp(
			id+eq+"("+id+")"+p0+sprite_add_url2+p1, // `_ = image_add(sprite_add_url2)`
		"g").exec(sprite_add_js)[1]].toString();
		var image_add_url = /function\s*\w*\s*\((\w+)/g.exec(image_add_js)[1];
		//
		var url_proc = new RegExp(
			id+eq+"("+id+")"+p0+image_add_url+p1, // `_ = url_proc(image_add_url)`
		"g").exec(image_add_js)[1];
		window[url_proc] = (function() {
			var f = window[url_proc];
			return function(url) {
				if (url.substring(0, 5) == "data:") return url;
				return f.apply(this, arguments);
			};
		})();
	})();
	//{ array
	window.gml$array_aop_2D = function(arr, i1, i2, o, v) {
		v = window.gml$op(arr[i1][i2], o, v);
		window.gml$array_set_2D(arr, i1, i2, v);
		return v;
	};
	//}
	//{ API wrapper
	var wrap_list = [], wrap_node;
	function wrap_next(name) {
		wrap_node = {
			name: name,
			map: Object.create(null),
			exists: null,
			free: null,
		};
		wrap_list.push(wrap_node);
	}
	function wrap_alloc(name) {
		var k = "gml$" + name;
		var f = window[k];
		var q = wrap_node;
		window[k] = function() {
			var r = f.apply(this, arguments);
			q.map[r] = true;
			return r;
		};
	}
	function wrap_free(name) {
		var k = "gml$" + name;
		var f = window[k];
		var q = wrap_node;
		q.free = f;
		window[k] = function(v) {
			var r = f.call(this, v);
			delete q.map[v];
			return r;
		};
	}
	function wrap_exists(name) {
		wrap_node.exists = window["gml$" + name];
	}
	function wrap_func(name, func) {
		var k = "gml$" + name;
		window[k] = func;
		found.push(k);
	}
	window.gml$game_cleanup = function() {
		for (var i = 0; i < wrap_list.length; i++) {
			var node = wrap_list[i];
			var free = node.free;
			var exists = node.exists;
			var map = node.map;
			for (var k in map) {
				if (!exists || exists.call(this, k)) {
					free.call(this, 0|k);
				}
				delete map.k;
			}
			node.map = Object.create(null);
		}
	}
	//}
	//{ ds_list
	wrap_next("ds_list");
	wrap_alloc("ds_list_create");
	wrap_free("ds_list_destroy");
	window.gml$ds_list_aop = function(q, i, o, v) {
		v = window.gml$op(window.gml$ds_list_find_value(q, i), o, v);
		window.gml$ds_list_set(q, i, v);
		return v;
	};
	window.gml$ds_list_find_value = (function() {
		var fn = fnjs(window.gml$ds_list_find_value);
		fn[0] = fn[0].replace(/\w+\("Error:[^,;]+[,;]/g, "");
		fn[0] = fn[0].replace(/return\s+0/g, "return undefined");
		fn[0] = fn[0].replace(/return\s+-1/g, 'throw "Data structure with index does not exist."');
		return new Function(fn[1], fn[2], fn[0]);
	})();
	//}
	//{ ds_map
	wrap_next("ds_map");
	wrap_alloc("ds_map_create");
	wrap_free("ds_map_destroy");
	window.gml$ds_map_aop = function(q, i, o, v) {
		v = window.gml$op(window.gml$ds_map_find_value(q, i), o, v);
		window.gml$ds_map_set(q, i, v);
		return v;
	};
	window.gml$ds_map_find_value = (function() {
		var fn = fnjs(window.gml$ds_map_find_value);
		return new Function(fn[1], fn[2], fn[0].replace(/\w+\("Error:[^,;]+[,;]/g, ""));
	})();
	//}
	//{ ds_grid
	wrap_next("ds_grid");
	wrap_alloc("ds_grid_create");
	wrap_free("ds_grid_destroy");
	window.gml$ds_grid_aop = function(q, i, k, o, v) {
		v = window.gml$op(window.gml$ds_grid_get(q, i, k), o, v);
		window.gml$ds_grid_set(q, i, k, v);
		return v;
	};
	//}
	//{ ds_stack
	wrap_next("ds_stack");
	wrap_alloc("ds_stack_create");
	wrap_free("ds_stack_destroy");
	//}
	//{ ds_queue
	wrap_next("ds_queue");
	wrap_alloc("ds_queue_create");
	wrap_free("ds_queue_destroy");
	//}
	//{ ds_priority
	wrap_next("ds_priority");
	wrap_alloc("ds_priority_create");
	wrap_free("ds_priority_destroy");
	//}
	//{ mp_grid
	wrap_next("mp_grid");
	wrap_alloc("mp_grid_create");
	wrap_free("mp_grid_destroy");
	//}
	//{ particles
	wrap_next("part_emitter");
	wrap_alloc("part_emitter_create");
	wrap_free("part_emitter_destroy");
	//
	wrap_next("part_system");
	wrap_alloc("part_system_create");
	wrap_free("part_system_destroy");
	//
	wrap_next("part_type");
	wrap_alloc("part_type_create");
	wrap_free("part_type_destroy");
	//}
	//{ tiles
	wrap_next("tile");
	wrap_alloc("tile_add");
	wrap_free("tile_delete");
	//}
	//{ buffer
	wrap_next("buffer");
	wrap_alloc("buffer_create");
	wrap_free("buffer_delete");
	//}
	//{ Timing
	window.get$current_time_rel = 0;
	window.get$current_time = function() {
		return new Date().getTime() - window.get$current_time_rel;
	}
	window.gml$get_timer = function() {
		return (new Date().getTime() - window.get$current_time_rel) * 1000;
	}
	//}
	//{ Sprite
	wrap_next("sprite");
	wrap_alloc("sprite_add");
	wrap_alloc("sprite_create_from_surface");
	wrap_alloc("sprite_duplicate");
	wrap_free("sprite_delete");
	wrap_func("sprite_create_colour", function(w, h, c, x, y) {
		var q = document.createElement("canvas");
		q.width = w;
		q.height = h;
		var r = q.getContext("2d");
		r.fillStyle = "rgb(" + (c & 255) + "," + ((c >> 8) & 255) + "," + ((c >> 16) & 255) + ")";
		r.fillRect(0, 0, w, h);
		return window.gml$sprite_add(q.toDataURL(), 1, 0, 0, x, y);
	});
	//}
	//{ Background
	wrap_next("background");
	wrap_alloc("background_add");
	wrap_alloc("background_create_from_surface");
	wrap_alloc("background_duplicate");
	wrap_free("background_delete");
	//}
	//{ Font
	wrap_next("font");
	wrap_alloc("font_add");
	wrap_alloc("font_add_sprite");
	wrap_alloc("font_add_sprite_ext");
	wrap_free("font_delete");
	//}
	//{ surface
	wrap_next("surface");
	wrap_alloc("surface_create");
	wrap_free("surface_free");
	wrap_exists("surface_exists");
	//}
	//{ GL
	wrap_next("d3d");
	wrap_alloc("d3d_start");
	wrap_free("d3d_end");
	//
	wrap_next("d3d_model");
	wrap_alloc("d3d_model_create");
	wrap_free("d3d_model_destroy");
	//
	wrap_next("vertex");
	wrap_alloc("vertex_create_buffer");
	wrap_alloc("vertex_create_buffer_ext");
	wrap_alloc("vertex_create_buffer_from_buffer");
	wrap_alloc("vertex_create_buffer_from_buffer_ext");
	wrap_free("◦vertex_delete_buffer");
	//}
	//{ Script
	window.gml$fieldcall = function(inst, field, other, __rest__) {
		var args = Array.prototype.slice.call(arguments, 1);
		args[0] = inst;
		return window.gml$scripts[inst[field]].apply(this, args);
	};
	window.gml$script_exists = function(index) {
		return window.gml$scripts[index] != null ? 1 : 0;
	};
	window.gml$script_get_name = function(index) {
		var fun = window.gml$scripts[index];
		if (fun) {
			var s = fun.name;
			if (s.length > 3 && s.substring(0, 3) == "js$") {
				return s.substring(3);
			} else return s;
		} else return "<undefined>";
	};
	//}
	//{ Drawing
	window.gml$texture_set_interpolation = (function() {
		var f = window.gml$texture_set_interpolation;
		return function(q) {
			var c = window.gml$window_device();
			if (c) {
				var v = q > 0.5;
				c.imageSmoothingEnabled = v;
				c.webkitImageSmoothingEnabled = v;
				c.mozImageSmoothingEnabled = v;
				c.msImageSmoothingEnabled = v;
			}
			return f(q);
		}
	})();
	window.gml$display_set_windows_alternate_sync = function(_) { };
	//
	(function() {
		var arr = ["window_set_size", "window_set_position", "window_set_rectangle"];
		for (var i = 0; i < arr.length; i++) (function(name) {
			var f = window["gml$" + name];
			return function() {
				window.gml$window_resized = true;
				return f.apply(this, arguments);
			};
		})(arr[i]);
	})();
	//}
	//{ Mouselock
	window.gml$mouse_lock = window.mouse_lock;
	window.gml$mouse_unlock = window.mouse_unlock;
	window.gml$mouse_is_locked = window.mouse_is_locked;
	window.get$mouse_delta_x = window.mouse_get_delta_x;
	window.get$mouse_delta_y = window.mouse_get_delta_y;
	wrap_next("pointer_lock");
	wrap_alloc("mouse_lock");
	wrap_free("mouse_unlock");
	//}
	//{ Game
	window.gml$game_prepare = function() {
		window.get$current_time_rel = new Date().getTime();
		window.gml$window_resized = false;
	};
	window.gml$game_start = function() {
		if (window.gml_Script_gmcallback_state() == null) return; // game not loaded yet!
		window.gml_Script_gmcallback_game_restart(window.gml$self, window.gml$other);
	};
	window.gml$game_end = function() {
		window.gml_Script_gmcallback_game_end(window.gml$self, window.gml$other);
	};
	window.onerror = function(e) {
		window.gml$trace(e);
	};
	window.div = function(a, b) {
		return ~~(a / ~~b);
	}
	//}
	// alias:
	for (var i = 0; i < found.length; i++) {
		var s = found[i];
		if (s.indexOf("colour") >= 0) {
			var k = s.replace("colour", "color");
			window[k] = window[s];
			found.push(k);
		}
	}
	//
	gml_Script_gmcallback_mark_post();
	window.mark_avail = true;
}
var traceCss = document.createElement("style");
traceCss.innerHTML = [
	"body {",
	"	overflow: hidden",
	"}",
	"#tracelist {",
	"	position: absolute;",
	"	left: 4px;",
	"	bottom: 6px;",
	"	padding: 0;",
	"	margin: 0;",
	"}",
	"#tracelist li {",
	"	list-style: none;",
	"	margin-top: 6px;",
	"}",
	"#tracelist li > span {",
	"	background: rgba(0, 0, 0, 0.7);",
	"	padding: 2px 5px;",
	"	color: rgb(222, 222, 222);",
	"	font: 11pt sans-serif;",
	"}",
	"#tracelist li .const { color: rgb(255, 128, 128) }",
	"#tracelist li .number { color: rgb(255, 128, 128) }",
	"#tracelist li .string { color: rgb(255, 128, 128) }",
].join("\n");
document.head.appendChild(traceCss);
var traceList = document.createElement("ul");
traceList.id = "tracelist";
document.body.appendChild(traceList);
function gml$trace_rec(val, out, depth) {
	var node, i;
	if (val == null) {
		node = document.createElement("span");
		node.className = "const";
		node.appendChild(document.createTextNode("null"));
		out.appendChild(node);
	} else if (typeof val == "boolean") {
		node = document.createElement("span");
		node.className = "const";
		node.appendChild(document.createTextNode(val ? "true" : "false"));
		out.appendChild(node);
	} else if (typeof val == "number") {
		node = document.createElement("span");
		node.className = "number";
		node.appendChild(document.createTextNode("" + val));
		out.appendChild(node);
	} else if (typeof val == "string") {
		node = document.createElement("span");
		node.className = "string";
		node.appendChild(document.createTextNode(val));
		out.appendChild(node);
	} else if (val instanceof Array) {
		node = document.createElement("span");
		node.appendChild(document.createTextNode("["));
		if (depth < 8) for (i = 0; i < val.length; i++) {
			if (i > 0) node.appendChild(document.createTextNode(", "));
			gml$trace_rec(val[i], node, depth + 1);
		} else node.appendChild(document.createTextNode("..."));
		node.appendChild(document.createTextNode("]"));
		out.appendChild(node);
	} else if (val instanceof Object) {
		node = document.createElement("span");
		node.appendChild(document.createTextNode("{"));
		i = 0;
		if (depth < 8) for (var k in val) {
			if (++i > 1) node.appendChild(document.createTextNode(","));
			node.appendChild(document.createTextNode(
				" " + (k.substr(0, 3) == "js$" ? k.substr(3) : k) + ": "
			));
			gml$trace_rec(val[k], node, depth + 1);
		} else node.appendChild(document.createTextNode("..."));
		node.appendChild(document.createTextNode(" }"));
		out.appendChild(node);
	} else out.appendChild(document.createTextNode(val.toString()));
}
function gml$trace_js(__rest__) {
	var args = Array.prototype.slice.call(arguments, 0);
	console.log.apply(console, arguments);
	var span = document.createElement("span");
	for (var i = 0; i < args.length; i++) {
		if (i > 0) span.appendChild(document.createTextNode(" "));
		gml$trace_rec(args[i], span, 0);
	}
	var node = document.createElement("li");
	node.appendChild(span);
	traceList.appendChild(node);
	if (traceList.children.length > 32) {
		traceList.removeChild(traceList.children[0]);
	}
};
function gml$trace_clear() {
	var i = traceList.children.length;
	while (--i >= 0) traceList.removeChild(traceList.children[i]);
}
///
function js_preloader(ctx, width, height, total, current, img) {
	var q = document.getElementById('spinload');
	if (q) {
		q.style.opacity = '' + (1 - current / total);
		if (current >= total) {
			setTimeout(function() {
				if (q.parentElement) q.parentElement.removeChild(q);
			}, 500);
		}
	}
}