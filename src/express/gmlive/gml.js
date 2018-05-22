function sfjs_extend(cls, sup, fields) {
	var proto;
	if (sup) {
		function base() { }
		base.prototype = sup.prototype;
		var proto = new base();
		for (var name in fields) proto[name] = fields[name];
		if (fields.toString !== Object.prototype.toString) proto.toString = fields.toString;
		
	} else proto = fields;
	cls.prototype = proto;
}
function sfjs_toString() {
	return js_Boot___string_rec(this, "");
}
//{ EReg
function EReg(r, opt) {
	this.r = new RegExp(r, opt.split("u").join(""));
}
EReg.prototype = {
	match: function(s) {
		if (this.r.global) this.r.lastIndex = 0;
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}, 
	matched: function(n) {
		if (this.r.m != null && n >= 0 && n < this.r.m.length) {
			return this.r.m[n];
		} else throw new js__Boot_HaxeError("EReg::matched");
	}
}
//}
//{ GmlBuilder
function GmlBuilder(src) {
	this.errorText = null;
	this.macroNodes = [];
	this.macroNames = [];
	this.enums = [];
	this.scripts = [];
	this.offset = 0;
	this.source = src;
	this.tokens = GmlParser_run(src);
	if (this.tokens != null) {
		this.length = this.tokens.length;
		this.buildLoop(src.main);
	} else {
		this.errorText = GmlParser_errorText;
		this.errorPos = GmlParser_errorPos;
	}
}
GmlBuilder.prototype = {
	errorAt: function(text, pos) {
		this.errorText = pos.toString() + ": " + text;
		this.errorPos = pos;
		return true;
	}, 
	error: function(text, tk) {
		return this.errorAt(text, tk[2]);
	}, 
	expectNode: function(text, node) {
		return this.errorAt("Expected " + text + ", got " + node[0], node[2]);
	}, 
	buildOps: function(firstPos, firstOp) {
		this.offset += 1;
		var nodes = [];
		nodes.push(this.outNode);
		var ops = [];
		ops.push(firstOp);
		var locs = [];
		locs.push(firstPos);
		var proc = true;
		var i;
		while (proc && this.offset < this.length) {
			if (this.buildExpr(1)) return true;
			nodes.push(this.outNode);
			if (this.offset < this.length) {
				var _g = this.tokens[this.offset];
				switch (_g[1]/* ast.GmlToken */) {
					case 18/* BinOp */:
						this.offset += 1;
						locs.push(_g[2]);
						ops.push(_g[3]);
						break;
					case 19/* SetOp */:
						if (_g[3] == -1) {
							this.offset += 1;
							locs.push(_g[2]);
							ops.push(64);
						} else proc = false;
						break;
					default: proc = false;
				}
			}
		}
		var pmin = 7;
		var pmax = 0;
		var n = ops.length;
		for (i = 0; i < n; ++i) {
			var pcur = ast__GmlOp_GmlOp_Impl__getPriority(ops[i]);
			if (pcur < pmin) pmin = pcur;
			if (pcur > pmax) pmax = pcur;
		}
		while (pmin <= pmax) {
			for (i = 0; i < n; ++i) if (ast__GmlOp_GmlOp_Impl__getPriority(ops[i]) == pmin) {
				nodes[i] = ast_GmlNode_BinOp(locs[i], ops[i], nodes[i], nodes[i + 1]);
				nodes.splice(i + 1, 1);
				ops.splice(i, 1);
				locs.splice(i, 1);
				--n;
				--i;
			}
			++pmin;
		}
		this.outNode = nodes[0];
		return false;
	}, 
	buildArgs: function(pos, sqb) {
		var args = [];
		var proc = true;
		var seenComma = true;
		var func = this.outNode;
		while (proc && this.offset < this.length) {
			var tk = this.tokens[this.offset];
			switch (tk[1]/* ast.GmlToken */) {
				case 4/* Comma */:
					if (seenComma) {
						return this.error("Unexpected comma", tk);
					} else {
						seenComma = true;
						this.offset += 1;
					}
					break;
				case 21/* ParClose */:
					if (sqb) {
						return this.error("Unexpected `)`", tk);
					} else {
						proc = false;
						this.offset += 1;
					}
					break;
				default:
					if (seenComma) {
						seenComma = false;
						if (this.buildExpr(0)) return true;
						args.push(this.outNode);
					} else return this.error("Expected a comma or closing token., got " + tk[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk);
			}
		}
		if (proc) return this.errorAt("Unclosed list", pos);
		if (sqb) {
			this.outNode = ast_GmlNode_ArrayDecl(pos, args);
		} else this.outNode = ast_GmlNode_Call(pos, func, args);
		return false;
	}, 
	buildExpr: function(flags) {
		if (this.offset >= this.length) return this.errorAt("Expected an expression", this.source.eof);
		var proc, sep, i, n, s, tk;
		var tk0 = this.tokens[this.offset++];
		var node, node2, nodes;
		switch (tk0[1]/* ast.GmlToken */) {
			case 0/* Header */: if ((flags & 4) != 0) {
				return this.error("Expected a statement, got a header (did you miss a closing bracket?)", tk0);
			} else return this.error("Expected an expression, got a header (did you miss a closing parenthesis?)", tk0);
			case 9/* Keyword */:
				switch (tk0[3]/* ast.GmlKeyword */) {
					case 0/* KwGlobal */:
						var d = tk0[2];
						if (this.offset >= this.length) {
							return this.errorAt("Expected a period", this.source.eof);
						} else if (this.tokens[this.offset][1] == 5) {
							this.offset += 1;
						} else return this.error("Expected a period", this.tokens[this.offset]);
						var _g1 = this.tokens[this.offset];
						if (_g1[1] == 10) {
							this.offset += 1;
							this.outNode = ast_GmlNode_Global(_g1[2], _g1[3]);
						} else {
							var tk1 = this.tokens[this.offset];
							return this.error("Expected a field name, got " + tk1[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk1);
						}
						break;
					case 24/* KwArgument */:
						if (this.offset >= this.length) {
							return this.errorAt("Expected an opening square bracket", this.source.eof);
						} else if (this.tokens[this.offset][1] == 22) {
							this.offset += 1;
						} else return this.error("Expected an opening square bracket", this.tokens[this.offset]);
						if (this.buildExpr(0)) return true;
						if (this.offset >= this.length) {
							return this.errorAt("Expected a closing square bracket", this.source.eof);
						} else if (this.tokens[this.offset][1] == 23) {
							this.offset += 1;
						} else return this.error("Expected a closing square bracket", this.tokens[this.offset]);
						this.outNode = ast_GmlNode_ArgIndex(tk0[2], this.outNode);
						break;
					case 25/* KwArgCount */: this.outNode = ast_GmlNode_ArgCount(tk0[2]); break;
					default: if ((flags & 4) != 0) {
						return this.error("Expected a statement, got " + tk0[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk0);
					} else return this.error("Expected a value, got " + tk0[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk0);
				}
				break;
			case 10/* Ident */:
				var s2 = tk0[3];
				switch (s2) {
					case "other": this.outNode = ast_GmlNode_Other(tk0[2]); break;
					case "self": this.outNode = ast_GmlNode_Self(tk0[2]); break;
					default:
						if (gml_asset_index[s2] != null) {
							i = gml_asset_index[s2];
							this.outNode = ast_GmlNode_Number(tk0[2], i, null);
						} else this.outNode = ast_GmlNode_Ident(tk0[2], s2);
				}
				break;
			case 12/* Undefined */: this.outNode = ast_GmlNode_Undefined(tk0[2]); break;
			case 13/* Number */: this.outNode = ast_GmlNode_Number(tk0[2], tk0[3], tk0[4]); break;
			case 14/* CString */: this.outNode = ast_GmlNode_CString(tk0[2], tk0[3]); break;
			case 15/* UnOp */:
				if (this.buildExpr(1)) return true;
				var _g4 = this.outNode;
				if (_g4[1] == 1) {
					var f1 = _g4[3];
					switch (tk0[3]/* ast.GmlUnOp */) {
						case 0: f1 = -f1; break;
						case 1: f1 = (f1 > 0.5) ? 0 : 1; break;
						case 2: f1 = ~(f1 | 0); break;
					}
					this.outNode = ast_GmlNode_Number(tk0[2], f1, null);
				} else this.outNode = ast_GmlNode_UnOp(tk0[2], this.outNode, tk0[3]);
				break;
			case 17/* Adjfix */:
				if (this.buildExpr(1)) return true;
				this.outNode = ast_GmlNode_Prefix(tk0[2], this.outNode, tk0[3]);
				break;
			case 18/* BinOp */:
				switch (tk0[3]) {
					case 16:
						var d9 = tk0[2];
						if (this.buildExpr(1)) return true;
						break;
					case 17:
						var d10 = tk0[2];
						if (this.buildExpr(1)) return true;
						var _g5 = this.outNode;
						if (_g5[1] == 1) {
							this.outNode = ast_GmlNode_Number(d10, -_g5[3], null);
						} else this.outNode = ast_GmlNode_UnOp(d10, this.outNode, 0);
						break;
					default: if ((flags & 4) != 0) {
						return this.error("Expected a statement, got " + tk0[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk0);
					} else return this.error("Expected a value, got " + tk0[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk0);
				}
				break;
			case 20/* ParOpen */:
				if (this.buildExpr(0)) return true;
				if (this.offset >= this.length) return this.error("Unclosed parenthesis", tk0);
				if (this.offset >= this.length) {
					return this.errorAt("Expected a closing parenthesis", this.source.eof);
				} else if (this.tokens[this.offset][1] == 21) {
					this.offset += 1;
				} else return this.error("Expected a closing parenthesis", this.tokens[this.offset]);
				break;
			case 22/* SqbOpen */:
				proc = true;
				sep = true;
				nodes = [];
				while (proc && this.offset < this.length) {
					switch (this.tokens[this.offset][1]/* ast.GmlToken */) {
						case 4/* Comma */:
							if (sep) {
								var tk2 = this.tokens[this.offset];
								return this.error("Expected a value or closing bracket, got " + tk2[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk2);
							} else {
								this.offset += 1;
								sep = true;
							}
							break;
						case 23/* SqbClose */:
							this.offset += 1;
							proc = false;
							break;
						default:
							if (this.buildExpr(0)) return true;
							nodes.push(this.outNode);
							sep = false;
					}
				}
				this.outNode = ast_GmlNode_ArrayDecl(tk0[2], nodes);
				break;
			case 24/* CubOpen */:
				var keys = [];
				nodes = [];
				proc = true;
				if (this.tokens[this.offset][1] == 25) {
					this.offset += 1;
				} else while (proc && this.offset < this.length) {
					var _g11 = this.tokens[this.offset];
					switch (_g11[1]/* ast.GmlToken */) {
						case 10/* Ident */:
							s = _g11[3];
							if ((gml_var_flags[s] & 4) != 0) return this.error("Cannot use built-in variable name `" + s + "` for an object field.", this.tokens[this.offset]);
							keys.push(s);
							this.offset += 1;
							if (this.offset >= this.length) {
								return this.errorAt("Expected a `:` in object declaration", this.source.eof);
							} else if (this.tokens[this.offset][1] == 6) {
								this.offset += 1;
							} else return this.error("Expected a `:` in object declaration", this.tokens[this.offset]);
							if (this.buildExpr(0)) return true;
							nodes.push(this.outNode);
							switch (this.tokens[this.offset][1]/* ast.GmlToken */) {
								case 4/* Comma */:
									this.offset += 1;
									if (this.tokens[this.offset][1] == 25) {
										this.offset += 1;
										proc = false;
									}
									break;
								case 25/* CubClose */:
									this.offset += 1;
									proc = false;
									break;
								default:
									var tk3 = this.tokens[this.offset];
									return this.error("Expected a `,` or a `}` in object declaration, got " + tk3[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk3);
							}
							break;
						case 14/* CString */:
							s = _g11[3];
							if ((gml_var_flags[s] & 4) != 0) return this.error("Cannot use built-in variable name `" + s + "` for an object field.", this.tokens[this.offset]);
							keys.push(s);
							this.offset += 1;
							if (this.offset >= this.length) {
								return this.errorAt("Expected a `:` in object declaration", this.source.eof);
							} else if (this.tokens[this.offset][1] == 6) {
								this.offset += 1;
							} else return this.error("Expected a `:` in object declaration", this.tokens[this.offset]);
							if (this.buildExpr(0)) return true;
							nodes.push(this.outNode);
							switch (this.tokens[this.offset][1]/* ast.GmlToken */) {
								case 4/* Comma */:
									this.offset += 1;
									if (this.tokens[this.offset][1] == 25) {
										this.offset += 1;
										proc = false;
									}
									break;
								case 25/* CubClose */:
									this.offset += 1;
									proc = false;
									break;
								default:
									var tk4 = this.tokens[this.offset];
									return this.error("Expected a `,` or a `}` in object declaration, got " + tk4[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk4);
							}
							break;
						default:
							var tk5 = this.tokens[this.offset];
							return this.error("Expected a key-value pair or a `}` in object declaration, got " + tk5[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk5);
					}
				}
				this.outNode = ast_GmlNode_ObjectDecl(tk0[2], keys, nodes);
				break;
			case 26/* ArgConst */: this.outNode = ast_GmlNode_ArgConst(tk0[2], tk0[3]); break;
			case 27/* CommentPost */:
				if (this.buildExpr(flags)) return true;
				this.outNode = ast_GmlNode_CommentLinePre(tk0[2], tk0[3], this.outNode);
				break;
			case 28/* CommentLine */:
				if (this.buildExpr(flags)) return true;
				this.outNode = ast_GmlNode_CommentLineSep(tk0[2], tk0[3], this.outNode);
				break;
			case 29/* CommentBlock */:
				if (this.buildExpr(flags)) return true;
				this.outNode = ast_GmlNode_CommentBlockPre(tk0[2], tk0[3], this.outNode, tk0[4]);
				break;
			default: if ((flags & 4) != 0) {
				return this.error("Expected a statement, got " + tk0[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk0);
			} else return this.error("Expected a value, got " + tk0[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk0);
		}
		proc = true;
		while (proc && this.offset < this.length) {
			tk = this.tokens[this.offset];
			switch (tk[1]/* ast.GmlToken */) {
				case 5/* Period */:
					if ((flags & 2) == 0) {
						this.offset += 1;
						var _g9 = this.tokens[this.offset];
						if (_g9[1] == 10) {
							s = _g9[3];
							this.offset += 1;
							this.outNode = ast_GmlNode_Field(tk[2], this.outNode, s);
						} else return this.error("Expected a field name", this.tokens[this.offset]);
					} else return this.error("Unexpected period", this.tokens[this.offset]);
					break;
				case 7/* QMark */:
					if ((flags & 1) == 0) {
						this.offset += 1;
						node = this.outNode;
						if (this.buildExpr(0)) return true;
						node2 = this.outNode;
						if (this.offset >= this.length) {
							return this.errorAt("Expected an else-colon", this.source.eof);
						} else if (this.tokens[this.offset][1] == 6) {
							this.offset += 1;
						} else return this.error("Expected an else-colon", this.tokens[this.offset]);
						if (this.buildExpr(0)) return true;
						this.outNode = ast_GmlNode_Ternary(tk[2], node, node2, this.outNode);
					} else proc = false;
					break;
				case 15/* UnOp */:
					if (tk[3] == 1) {
						if ((flags & 2) == 0) {
							this.offset += 1;
							if (this.tokens[this.offset][1] == 16) {
								node = this.outNode;
								this.offset += 1;
								if (this.buildExpr(1)) return true;
								this.outNode = ast_GmlNode_In(tk[2], node, this.outNode, true);
							} else this.offset -= 1;
						}
					} else proc = false;
					break;
				case 16/* In */:
					if ((flags & 2) == 0) {
						node = this.outNode;
						this.offset += 1;
						if (this.buildExpr(1)) return true;
						this.outNode = ast_GmlNode_In(tk[2], node, this.outNode, false);
					}
					break;
				case 17/* Adjfix */:
					if ((flags & 2) == 0) {
						this.offset += 1;
						this.outNode = ast_GmlNode_Postfix(tk[2], this.outNode, tk[3]);
						flags |= 2;
					} else if (tk[3]) {
						return this.errorAt("Unexpected `++`", tk[2]);
					} else return this.errorAt("Unexpected `--`", tk[2]);
					break;
				case 18/* BinOp */:
					if ((flags & 1) == 0) {
						if (this.buildOps(tk[2], tk[3])) return true;
						flags |= 2;
					} else proc = false;
					break;
				case 19/* SetOp */:
					if (tk[3] == -1) {
						if ((flags & 1) == 0) {
							if (this.buildOps(tk[2], 64)) return true;
							flags |= 2;
						} else proc = false;
					} else proc = false;
					break;
				case 20/* ParOpen */:
					if ((flags & 2) == 0) {
						this.offset += 1;
						if (this.buildArgs(tk[2], false)) return true;
					} else return this.errorAt("Unexpected `(`", tk[2]);
					break;
				case 22/* SqbOpen */:
					var d24 = tk[2];
					if ((flags & 2) == 0) {
						this.offset += 1;
						if (this.offset >= this.length) return this.errorAt("Expected an index", this.source.eof);
						node = this.outNode;
						var _g19 = this.tokens[this.offset];
						switch (_g19[1]/* ast.GmlToken */) {
							case 2/* Hash */:
								this.offset += 1;
								if (this.buildExpr(0)) return true;
								node2 = this.outNode;
								if (this.offset >= this.length) {
									return this.errorAt("Expected a comma", this.source.eof);
								} else if (this.tokens[this.offset][1] == 4) {
									this.offset += 1;
								} else return this.error("Expected a comma", this.tokens[this.offset]);
								if (this.buildExpr(0)) return true;
								if (this.offset >= this.length) {
									return this.errorAt("Expected a closing bracket", this.source.eof);
								} else if (this.tokens[this.offset][1] == 23) {
									this.offset += 1;
								} else return this.error("Expected a closing bracket", this.tokens[this.offset]);
								this.outNode = ast_GmlNode_DsGrid(d24, node, node2, this.outNode);
								break;
							case 7/* QMark */:
								this.offset += 1;
								if (this.buildExpr(0)) return true;
								if (this.offset >= this.length) {
									return this.errorAt("Expected a closing bracket", this.source.eof);
								} else if (this.tokens[this.offset][1] == 23) {
									this.offset += 1;
								} else return this.error("Expected a closing bracket", this.tokens[this.offset]);
								this.outNode = ast_GmlNode_DsMap(d24, node, this.outNode);
								break;
							case 8/* AtSign */:
								this.offset += 1;
								if (this.buildExpr(0)) return true;
								if (this.offset >= this.length) return this.errorAt("Expected comma or a closing bracket", this.source.eof);
								switch (this.tokens[this.offset][1]/* ast.GmlToken */) {
									case 4/* Comma */:
										this.offset += 1;
										node2 = this.outNode;
										if (this.buildExpr(0)) return true;
										if (this.offset >= this.length) {
											return this.errorAt("Expected a closing bracket", this.source.eof);
										} else if (this.tokens[this.offset][1] == 23) {
											this.offset += 1;
										} else return this.error("Expected a closing bracket", this.tokens[this.offset]);
										this.outNode = ast_GmlNode_RawId2d(d24, node, node2, this.outNode);
										break;
									case 23/* SqbClose */:
										this.offset += 1;
										this.outNode = ast_GmlNode_RawId(d24, node, this.outNode);
										break;
									default:
										var tk6 = this.tokens[this.offset];
										this.error("Expected comma or a closing bracket, got " + tk6[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk6);
								}
								break;
							case 18/* BinOp */:
								if (_g19[3] == 48) {
									this.offset += 1;
									if (this.buildExpr(0)) return true;
									if (this.offset >= this.length) {
										return this.errorAt("Expected a closing bracket", this.source.eof);
									} else if (this.tokens[this.offset][1] == 23) {
										this.offset += 1;
									} else return this.error("Expected a closing bracket", this.tokens[this.offset]);
									this.outNode = ast_GmlNode_DsList(d24, node, this.outNode);
								} else proc = false;
								break;
							default: proc = false;
						}
						if (!proc) {
							proc = true;
							if (this.buildExpr(0)) return true;
							if (this.offset >= this.length) return this.errorAt("Expected comma or a closing bracket", this.source.eof);
							switch (this.tokens[this.offset][1]/* ast.GmlToken */) {
								case 4/* Comma */:
									this.offset += 1;
									node2 = this.outNode;
									if (this.buildExpr(0)) return true;
									if (this.offset >= this.length) {
										return this.errorAt("Expected a closing bracket", this.source.eof);
									} else if (this.tokens[this.offset][1] == 23) {
										this.offset += 1;
									} else return this.error("Expected a closing bracket", this.tokens[this.offset]);
									this.outNode = ast_GmlNode_Index2d(d24, node, node2, this.outNode);
									break;
								case 23/* SqbClose */:
									this.offset += 1;
									this.outNode = ast_GmlNode_Index(d24, node, this.outNode);
									break;
								default:
									var tk7 = this.tokens[this.offset];
									this.error("Expected comma or a closing bracket, got " + tk7[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk7);
							}
						}
					} else return this.errorAt("Unexpected `[`", d24);
					break;
				case 27/* CommentPost */:
					this.offset += 1;
					this.outNode = ast_GmlNode_CommentLinePost(tk[2], this.outNode, tk[3]);
					break;
				case 28/* CommentLine */: this.offset += 1; break;
				case 29/* CommentBlock */:
					this.offset += 1;
					this.outNode = ast_GmlNode_CommentBlockPost(tk[2], this.outNode, tk[3], tk[4]);
					break;
				default: proc = false;
			}
		}
		return false;
	}, 
	buildLine: function() {
		if (this.offset >= this.length) return this.errorAt("Expected a statement", this.source.eof);
		var tk = this.tokens[this.offset++];
		var tk2, proc, sep, x, x1, x2, nodes, i, s, d;
		var unknown = false;
		switch (tk[1]/* ast.GmlToken */) {
			case 1/* Macro */:
				var _g = this.tokens[this.offset++];
				if (_g[1] == 10) {
					if (this.buildExpr(0)) return true;
					var i1 = this.macroNames.length;
					this.macroNames[i1] = _g[3];
					this.macroNodes[i1] = this.outNode;
					this.outNode = ast_GmlNode_Block(tk[2], []);
				} else this.error("Expected a macro name", this.tokens[this.offset]);
				break;
			case 9/* Keyword */:
				switch (tk[3]/* ast.GmlKeyword */) {
					case 1/* KwGlobalVar */:
						d = tk[2];
						this.outNode = ast_GmlNode_Block(d, []);
						while (this.offset < this.length) {
							tk2 = this.tokens[this.offset++];
							if (tk2[1] == 10) {
								d = tk2[2];
								s = tk2[3];
								i = this.macroNames.length;
								this.macroNames[i] = s;
								this.macroNodes[i] = ast_GmlNode_Global(d, s);
								if (this.tokens[this.offset][1] == 4) {
									this.offset += 1;
									continue;
								}
							} else return this.error("Expected a global variable name.", tk2);
							break;
						}
						break;
					case 2/* KwVar */:
						nodes = [];
						proc = true;
						while (proc && this.offset < this.length) {
							tk2 = this.tokens[this.offset++];
							if (tk2[1] == 10) {
								if (this.offset >= this.length) return this.errorAt("Expected a variable value", this.source.eof);
								tk = this.tokens[this.offset];
								if (tk[1] == 19) {
									if (tk[3] == -1) {
										this.offset += 1;
										if (this.buildExpr(0)) return true;
									} else this.outNode = null;
								} else this.outNode = null;
								nodes.push(ast_GmlNode_VarDecl(tk2[2], tk2[3], this.outNode));
								if (this.offset < this.length) switch (this.tokens[this.offset][1]/* ast.GmlToken */) {
									case 3/* Semico */:
										this.offset += 1;
										proc = false;
										break;
									case 4/* Comma */: this.offset += 1; break;
									case 10/* Ident */:
										this.offset += 1;
										if (this.offset < this.length) {
											var _g3 = this.tokens[this.offset];
											if (_g3[1] == 19) {
												if (_g3[3] == -1) {
													this.offset -= 1;
													return this.error("Suspicious assignment after a variable declaration. Did you forget a `,` or a `;`?", this.tokens[this.offset]);
												}
											}
										}
										this.offset -= 1;
										proc = false;
										break;
									default: proc = false;
								}
							} else return this.error("Expected a variable name, got " + tk2[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk2);
						}
						if (nodes.length != 1) {
							this.outNode = ast_GmlNode_Block(tk[2], nodes);
						} else this.outNode = nodes[0];
						break;
					case 3/* KwEnum */:
						var e;
						var _g4 = this.tokens[this.offset];
						if (_g4[1] == 10) {
							var s2 = _g4[3];
							var d5 = _g4[2];
							this.offset += 1;
							e = new ast_GmlEnum(s2, d5);
						} else return this.error("Expected an enum name", this.tokens[this.offset]);
						if (this.offset >= this.length) {
							return this.errorAt("Expected enum block", this.source.eof);
						} else if (this.tokens[this.offset][1] == 24) {
							this.offset += 1;
						} else return this.error("Expected enum block", this.tokens[this.offset]);
						proc = true;
						sep = true;
						while (this.offset < this.length && proc) {
							var _g12 = this.tokens[this.offset];
							switch (_g12[1]/* ast.GmlToken */) {
								case 4/* Comma */:
									if (sep) {
										return this.error("Unexpected comma", this.tokens[this.offset]);
									} else {
										this.offset += 1;
										sep = true;
									}
									break;
								case 10/* Ident */:
									if (sep) {
										this.offset += 1;
										var _g13 = this.tokens[this.offset];
										if (_g13[1] == 19) {
											if (_g13[3] == -1) {
												this.offset += 1;
												if (this.buildExpr(0)) return true;
											} else this.outNode = null;
										} else this.outNode = null;
										var ec = new ast_GmlEnumCtr(_g12[3], _g12[2], this.outNode);
										e.ctrList.push(ec);
										e.ctrMap[ec.name] = ec;
										sep = false;
									} else {
										var tk1 = this.tokens[this.offset];
										return this.error("Expected a comma or a closing bracket, got " + tk1[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk1);
									}
									break;
								case 25/* CubClose */:
									this.offset += 1;
									proc = false;
									break;
								default:
									var tk3 = this.tokens[this.offset];
									return this.error("Expected a comma, enum entry, or closing bracket, got " + tk3[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk3);
							}
						}
						if (proc) return this.error("Unclosed enum-block", tk);
						this.enums.push(e);
						this.outNode = ast_GmlNode_Block(tk[2], []);
						break;
					case 4/* KwIf */:
						if (this.buildExpr(0)) return true;
						x1 = this.outNode;
						if (this.offset >= this.length) return this.errorAt("Expected a then-expression", this.source.eof);
						var _g5 = this.tokens[this.offset];
						if (_g5[1] == 9) {
							if (_g5[3] == 5) this.offset += 1;
						}
						if (this.buildLine()) return true;
						x2 = this.outNode;
						while (this.offset < this.length) {
							switch (this.tokens[this.offset][1]/* ast.GmlToken */) {
								case 27/* CommentPost */: case 28/* CommentLine */: case 29/* CommentBlock */:
									this.offset += 1;
									continue;
							}
							break;
						}
						if (this.offset < this.length) {
							var _g15 = this.tokens[this.offset];
							if (_g15[1] == 9) {
								if (_g15[3] == 6) {
									this.offset += 1;
									if (this.buildLine()) return true;
									x = this.outNode;
								} else x = null;
							} else x = null;
						} else x = null;
						this.outNode = ast_GmlNode_IfThen(tk[2], x1, x2, x);
						break;
					case 7/* KwSwitch */:
						var d7 = tk[2];
						if (this.buildExpr(0)) return true;
						x1 = this.outNode;
						var cc = [];
						var c = null;
						if (this.offset >= this.length) {
							return this.errorAt("Expected switch-block body", this.source.eof);
						} else if (this.tokens[this.offset][1] == 24) {
							this.offset += 1;
						} else return this.error("Expected switch-block body", this.tokens[this.offset]);
						if (this.offset >= this.length) return this.errorAt("Expected switch-block contents", this.source.eof);
						var _g7 = this.tokens[this.offset];
						switch (_g7[1]/* ast.GmlToken */) {
							case 9/* Keyword */:
								switch (_g7[3]/* ast.GmlKeyword */) {
									case 8/* KwCase */: case 9/* KwDefault */: break;
									default:
										var tk4 = this.tokens[this.offset];
										return this.error("Expected `case` or `default`, got " + tk4[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk4);
								}
								break;
							case 27/* CommentPost */: case 28/* CommentLine */: case 29/* CommentBlock */: break;
							default:
								var tk5 = this.tokens[this.offset];
								return this.error("Expected `case` or `default`, got " + tk5[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk5);
						}
						proc = true;
						x2 = null;
						nodes = null;
						var pre = [];
						while (this.offset < this.length && proc) {
							var _g16 = this.tokens[this.offset];
							switch (_g16[1]/* ast.GmlToken */) {
								case 9/* Keyword */:
									switch (_g16[3]/* ast.GmlKeyword */) {
										case 8/* KwCase */:
											this.offset += 1;
											if (this.buildExpr(0)) return true;
											if (this.offset >= this.length) {
												return this.errorAt("Expected a colon", this.source.eof);
											} else if (this.tokens[this.offset][1] == 6) {
												this.offset += 1;
											} else return this.error("Expected a colon", this.tokens[this.offset]);
											nodes = [this.outNode];
											while (this.offset < this.length) {
												var _g18 = this.tokens[this.offset];
												if (_g18[1] == 9) {
													if (_g18[3] == 8) {
														this.offset += 1;
														if (this.buildExpr(0)) return true;
														if (this.offset >= this.length) {
															return this.errorAt("Expected a colon", this.source.eof);
														} else if (this.tokens[this.offset][1] == 6) {
															this.offset += 1;
														} else return this.error("Expected a colon", this.tokens[this.offset]);
														nodes.push(this.outNode);
														continue;
													}
												}
												break;
											}
											c = {
												values: nodes, 
												expr: null, 
												pre: pre
											};
											cc.push(c);
											nodes = [];
											pre = [];
											c.expr = ast_GmlNode_Block(_g16[2], nodes);
											break;
										case 9/* KwDefault */:
											this.offset += 1;
											if (this.offset >= this.length) {
												return this.errorAt("Expected a colon", this.source.eof);
											} else if (this.tokens[this.offset][1] == 6) {
												this.offset += 1;
											} else return this.error("Expected a colon", this.tokens[this.offset]);
											nodes = [];
											x2 = ast_GmlNode_Block(_g16[2], nodes);
											break;
										default:
											if (this.buildLine()) return true;
											nodes.push(this.outNode);
									}
									break;
								case 25/* CubClose */:
									this.offset += 1;
									proc = false;
									break;
								case 27/* CommentPost */:
									this.offset += 1;
									pre.push(ast_GmlNode_CommentLine(_g16[2], _g16[3]));
									break;
								case 28/* CommentLine */:
									this.offset += 1;
									pre.push(ast_GmlNode_CommentLine(_g16[2], _g16[3]));
									break;
								case 29/* CommentBlock */:
									this.offset += 1;
									pre.push(ast_GmlNode_CommentBlock(_g16[2], _g16[3]));
									break;
								default:
									if (this.buildLine()) return true;
									nodes.push(this.outNode);
							}
						}
						if (proc) return this.errorAt("Unclosed switch-block", d7);
						this.outNode = ast_GmlNode_Switch(d7, x1, cc, x2);
						break;
					case 10/* KwRepeat */:
						if (this.buildExpr(0)) return true;
						x1 = this.outNode;
						if (this.buildLine()) return true;
						this.outNode = ast_GmlNode_Repeat(tk[2], x1, this.outNode);
						break;
					case 11/* KwWhile */:
						if (this.buildExpr(0)) return true;
						x1 = this.outNode;
						if (this.buildLine()) return true;
						this.outNode = ast_GmlNode_While(tk[2], x1, this.outNode);
						break;
					case 13/* KwDo */:
						var d13 = tk[2];
						if (this.buildLine()) return true;
						x1 = this.outNode;
						if (this.offset >= this.length) return this.errorAt("Expected a `while` or `until`", this.source.eof);
						var _g8 = this.tokens[this.offset];
						if (_g8[1] == 9) {
							switch (_g8[3]/* ast.GmlKeyword */) {
								case 11/* KwWhile */:
									this.offset += 1;
									if (this.buildExpr(0)) return true;
									this.outNode = ast_GmlNode_DoWhile(d13, x1, this.outNode);
									break;
								case 12/* KwUntil */:
									this.offset += 1;
									if (this.buildExpr(0)) return true;
									this.outNode = ast_GmlNode_DoWhile(d13, x1, ast_GmlNodeTools_invert(this.outNode));
									break;
								default:
									var tk6 = this.tokens[this.offset];
									return this.error("Expected a `while` or `until`, got " + tk6[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk6);
							}
						} else {
							var tk7 = this.tokens[this.offset];
							return this.error("Expected a `while` or `until`, got " + tk7[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk7);
						}
						break;
					case 14/* KwFor */:
						if (this.offset >= this.length) return this.errorAt("Expected for-loop header", this.source.eof);
						if (this.tokens[this.offset][1] == 20) {
							this.offset += 1;
							proc = true;
						} else proc = false;
						if (this.buildLine()) return true;
						x = this.outNode;
						if (this.buildExpr(0)) return true;
						x1 = this.outNode;
						if (this.offset >= this.length) return this.errorAt("Expected for-loop post-action", this.source.eof);
						if (this.tokens[this.offset][1] == 3) this.offset += 1;
						if (this.buildLine()) return true;
						x2 = this.outNode;
						if (proc) {
							if (this.tokens[this.offset][1] == 21) {
								this.offset += 1;
							} else {
								var tk8 = this.tokens[this.offset];
								return this.error("Expected a closing parenthesis, got " + tk8[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk8);
							}
						}
						if (this.buildLine()) return true;
						this.outNode = ast_GmlNode_For(tk[2], x, x1, x2, this.outNode);
						break;
					case 15/* KwWith */:
						if (this.buildExpr(0)) return true;
						x1 = this.outNode;
						if (this.buildLine()) return true;
						this.outNode = ast_GmlNode_With(tk[2], x1, this.outNode);
						break;
					case 16/* KwContinue */: this.outNode = ast_GmlNode_Continue(tk[2]); break;
					case 17/* KwBreak */: this.outNode = ast_GmlNode_Break(tk[2]); break;
					case 18/* KwReturn */:
						if (this.buildExpr(0)) return true;
						this.outNode = ast_GmlNode_Return(tk[2], this.outNode);
						break;
					case 19/* KwExit */: this.outNode = ast_GmlNode_Exit(tk[2]); break;
					case 20/* KwWait */:
						if (this.buildExpr(0)) return true;
						this.outNode = ast_GmlNode_Wait(tk[2], this.outNode);
						break;
					case 21/* KwTry */:
						if (this.buildLine()) return true;
						x1 = this.outNode;
						if (this.offset >= this.length) {
							return this.errorAt("Expected a catch-block", this.source.eof);
						} else {
							var _g10 = this.tokens[this.offset];
							if (_g10[1] == 9) {
								if (_g10[3] == 22) {
									this.offset += 1;
								} else return this.error("Expected a catch-block", this.tokens[this.offset]);
							} else return this.error("Expected a catch-block", this.tokens[this.offset]);
						}
						if (this.tokens[this.offset][1] == 20) {
							this.offset += 1;
							proc = true;
						} else proc = false;
						if (this.offset >= this.length) {
							return this.errorAt("Expected a capture variable name", this.source.eof);
						} else {
							var _g112 = this.tokens[this.offset];
							if (_g112[1] == 10) {
								this.offset += 1;
								s = _g112[3];
							} else return this.error("Expected a capture variable name", this.tokens[this.offset]);
						}
						if (proc) {
							if (this.offset >= this.length) {
								return this.errorAt("Expected a closing parenthesis", this.source.eof);
							} else if (this.tokens[this.offset][1] == 21) {
								this.offset += 1;
							} else return this.error("Expected a closing parenthesis", this.tokens[this.offset]);
						}
						if (this.buildLine()) return true;
						this.outNode = ast_GmlNode_TryCatch(tk[2], x1, s, this.outNode);
						break;
					case 23/* KwThrow */:
						if (this.buildExpr(0)) return true;
						this.outNode = ast_GmlNode_Throw(tk[2], this.outNode);
						break;
					case 26/* KwDebugger */: this.outNode = ast_GmlNode_Debugger(tk[2]); break;
					default: unknown = true;
				}
				break;
			case 24/* CubOpen */:
				var start = tk[2];
				proc = true;
				nodes = [];
				if (this.offset < this.length) {
					var _g22 = this.tokens[this.offset];
					if (_g22[1] == 27) {
						nodes.push(ast_GmlNode_CommentLine(_g22[2], _g22[3]));
						this.offset += 1;
					}
				}
				while (proc && this.offset < this.length) {
					var _g23 = this.tokens[this.offset];
					switch (_g23[1]/* ast.GmlToken */) {
						case 25/* CubClose */:
							this.offset += 1;
							proc = false;
							break;
						case 28/* CommentLine */:
							this.offset += 1;
							nodes.push(ast_GmlNode_CommentLine(_g23[2], _g23[3]));
							break;
						case 29/* CommentBlock */:
							switch (_g23[4]) {
								case false:
									if (this.buildLine()) return true;
									nodes.push(ast_GmlNode_CommentBlockPre(_g23[2], _g23[3], this.outNode, false));
									break;
								case true:
									this.offset += 1;
									nodes.push(ast_GmlNode_CommentBlock(_g23[2], _g23[3]));
									break;
							}
							break;
						default:
							if (this.buildLine()) return true;
							nodes.push(this.outNode);
					}
				}
				if (proc) return this.errorAt("Expected a closing bracket.", start);
				this.outNode = ast_GmlNode_Block(start, nodes);
				break;
			case 27/* CommentPost */:
				if (this.buildLine()) return true;
				this.outNode = ast_GmlNode_CommentLinePre(tk[2], tk[3], this.outNode);
				break;
			case 28/* CommentLine */:
				if (this.offset < this.length) {
					if (this.buildLine()) return true;
					this.outNode = ast_GmlNode_CommentLineSep(tk[2], tk[3], this.outNode);
				} else this.outNode = ast_GmlNode_CommentLine(tk[2], tk[3]);
				break;
			case 29/* CommentBlock */:
				if (this.offset < this.length) {
					if (this.buildLine()) return true;
					this.outNode = ast_GmlNode_CommentBlockPre(tk[2], tk[3], this.outNode, tk[4]);
				} else this.outNode = ast_GmlNode_CommentBlock(tk[2], tk[3]);
				break;
			default: unknown = true;
		}
		if (unknown) this.offset -= 1;
		if (unknown) {
			if (this.buildExpr(5)) return true;
			if (this.offset < this.length) {
				var _g24 = this.tokens[this.offset];
				if (_g24[1] == 19) {
					x = this.outNode;
					this.offset += 1;
					if (this.buildExpr(0)) return true;
					this.outNode = ast_GmlNode_SetOp(_g24[2], _g24[3], x, this.outNode);
				} else if (!ast_GmlNodeTools_isStatement(this.outNode)) return this.expectNode("a statement", this.outNode);
			} else if (!ast_GmlNodeTools_isStatement(this.outNode)) return this.expectNode("a statement", this.outNode);
		}
		while (this.offset < this.length) {
			if (this.tokens[this.offset][1] == 3) {
				this.offset += 1;
				continue;
			}
			break;
		}
		if (this.offset < this.length) {
			var _g26 = this.tokens[this.offset];
			if (_g26[1] == 27) {
				this.offset += 1;
				this.outNode = ast_GmlNode_CommentLinePost(_g26[2], this.outNode, _g26[3]);
			}
		}
		return false;
	}, 
	buildOuter: function(name, namedArgs, namedArgc) {
		if (namedArgs == null) namedArgs = null;
		if (namedArgc == null) namedArgc = 0;
		var scr = new ast_GmlScript(this.source, name, (this.offset >= this.length) ? this.source.eof : this.tokens[this.offset][2]);
		if (namedArgs == null) namedArgs = Object.create(null);
		scr.namedArgs = namedArgs;
		scr.arguments = namedArgc;
		this.scripts.push(scr);
		var nodes = [];
		var proc = true;
		while (this.offset < this.length) {
			var _g = this.tokens[this.offset];
			switch (_g[1]/* ast.GmlToken */) {
				case 0/* Header */: break;
				case 28/* CommentLine */:
					nodes.push(ast_GmlNode_CommentLine(_g[2], _g[3]));
					this.offset += 1;
					continue;
				default:
					if (this.buildLine()) return true;
					nodes.push(this.outNode);
					continue;
			}
			break;
		}
		if (nodes.length > 1) {
			scr.node = ast_GmlNode_Block(nodes[0][2], nodes);
		} else if (nodes.length == 1) {
			scr.node = nodes[0];
		} else scr.node = ast_GmlNode_Block(this.source.eof, nodes);
		return false;
	}, 
	buildLoop: function(first) {
		if (this.buildOuter(first)) return true;
		while (this.offset < this.length) {
			var tk = this.tokens[this.offset];
			if (tk[1] == 0) {
				this.offset += 1;
				var nextName = tk[3];
				var nextArgs = null;
				var nextArgc = 0;
				if (!(tk[4] || this.offset >= this.length)) {
					if (this.tokens[this.offset][1] == 20) {
						this.offset += 1;
						nextArgs = Object.create(null);
						var proc = true;
						if (this.offset >= this.length) return this.errorAt("Expected script arguments", this.source.eof);
						if (this.tokens[this.offset][1] == 21) {
							this.offset += 1;
						} else while (proc && this.offset < this.length) {
							var _g11 = this.tokens[this.offset];
							if (_g11[1] == 10) {
								var s = _g11[3];
								var nextArg = s;
								if (nextArgs[nextArg] != null) return this.error("An argument named " + nextArg + " is already defined at position " + nextArgs[nextArg], this.tokens[this.offset]);
								nextArgs[s] = nextArgc;
								++nextArgc;
								this.offset += 1;
								switch (this.tokens[this.offset][1]/* ast.GmlToken */) {
									case 4/* Comma */: this.offset += 1; break;
									case 21/* ParClose */:
										this.offset += 1;
										proc = false;
										break;
									default:
										var tk1 = this.tokens[this.offset];
										return this.error("Expected a comma or closing parenthesis in script arguments, got " + tk1[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk1);
								}
							} else {
								var tk2 = this.tokens[this.offset];
								return this.error("Expected an argument, got " + tk2[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk2);
							}
						}
					}
				}
				if (this.buildOuter(nextName, nextArgs, nextArgc)) return true;
			} else return this.error("Expected A script declaration, got " + tk[0] + " in\n\t" + haxe_CallStack_callStack().join("\n\t"), tk);
		}
		return false;
	}, 
	postcheck: function() {
		return false;
	}
}
//}
//{ GmlParser
function GmlParser_error(text, pos) {
	GmlParser_errorText = pos.toString() + ": " + text;
	GmlParser_errorPos = pos;
	return null;
}
function GmlParser_run(src, temStart) {
	if (temStart == null) temStart = -1;
	var z, s, i, n, zi, row, rowStart, pos, tks;
	var out = [];
	if (temStart >= 0) {
		row = GmlParser_temRow;
		rowStart = GmlParser_temRowStart;
		pos = temStart;
	} else {
		row = 1;
		rowStart = 0;
		pos = 0;
	}
	var file = src.name;
	var code = src.code;
	var sb = null;
	var len = src.length;
	out.__parser__ = this;
	var checkLine = false;
	var brackets = 0;
	while (pos < len) {
		var c = code.charCodeAt(pos++);
		switch (c) {
			case 10:
				if (checkLine) {
					i = out.length - 1;
					var _g = out[i];
					if (_g[1] == 0) {
						if (_g[4] == false) out[i] = ast_GmlToken_Header(_g[2], _g[3], true);
					}
				}
				++row;
				rowStart = pos;
				continue;
			case 9: case 13: case 32: continue;
		}
		var start = pos - 1;
		var d1 = new ast_GmlPos(src, row, pos - rowStart);
		var op;
		switch (c) {
			case 33:
				if (code.charCodeAt(pos) == 61) {
					++pos;
					op = 65;
					if (code.charCodeAt(pos) == 61) {
						++pos;
						out.push(ast_GmlToken_SetOp(d1, op));
					} else out.push(ast_GmlToken_BinOp(d1, op));
				} else out.push(ast_GmlToken_UnOp(d1, 1));
				break;
			case 34:
				n = pos;
				for (i = code.charCodeAt(pos); i != c && pos < len; i = code.charCodeAt(pos)) {
					if (i == 10) {
						++row;
						rowStart = pos;
					}
					++pos;
				}
				if (pos < len) {
					s = code.substring(n, pos++);
				} else {
					GmlParser_error("Unclosed string", d1);
					s = null;
				}
				if (s == null) return null;
				out.push(ast_GmlToken_CString(d1, code.substring(start + 1, pos - 1)));
				break;
			case 35:
				start = pos;
				while (pos < len) {
					c = code.charCodeAt(pos);
					if (c == 95 || c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57) {
						++pos;
					} else break;
				}
				switch (code.substring(start, pos)) {
					case "define":
						start = pos;
						while (pos < len) {
							c = code.charCodeAt(pos);
							if (c == 32 || c == 9) {
								++pos;
							} else break;
						}
						if ((c == 95 || c >= 97 && c <= 122 || c >= 65 && c <= 90) && pos < len) {
							start = pos;
							++pos;
							while (pos < len) {
								c = code.charCodeAt(pos);
								if (c == 95 || c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57) {
									++pos;
								} else break;
							}
							out.push(ast_GmlToken_Header(d1, code.substring(start, pos), false));
							checkLine = true;
						} else return GmlParser_error("Expected a script name", d1);
						break;
					case "macro": out.push(ast_GmlToken_Macro(d1)); break;
					case "endregion": case "region":
						while (pos < len) {
							i = code.charCodeAt(pos);
							if (i == 10 || i == 13) {
								break;
							} else ++pos;
						}
						break;
					default:
						out.push(ast_GmlToken_Hash(d1));
						pos = start;
				}
				break;
			case 36:
				while (pos < len) {
					c = code.charCodeAt(pos);
					if (c >= 48 && c <= 57 || c >= 97 && c <= 102 || c >= 65 && c <= 70) {
						++pos;
					} else break;
				}
				s = "0x" + code.substring(start + 1, pos);
				out.push(ast_GmlToken_Number(d1, Std_parseInt(s), s));
				break;
			case 37:
				op = 2;
				if (code.charCodeAt(pos) == 61) {
					++pos;
					out.push(ast_GmlToken_SetOp(d1, op));
				} else out.push(ast_GmlToken_BinOp(d1, op));
				break;
			case 38:
				if (code.charCodeAt(pos) == 38) {
					++pos;
					op = 80;
					if (code.charCodeAt(pos) == 61) {
						++pos;
						out.push(ast_GmlToken_SetOp(d1, op));
					} else out.push(ast_GmlToken_BinOp(d1, op));
				} else {
					op = 49;
					if (code.charCodeAt(pos) == 61) {
						++pos;
						out.push(ast_GmlToken_SetOp(d1, op));
					} else out.push(ast_GmlToken_BinOp(d1, op));
				}
				break;
			case 39:
				n = pos;
				for (i = code.charCodeAt(pos); i != c && pos < len; i = code.charCodeAt(pos)) {
					if (i == 10) {
						++row;
						rowStart = pos;
					}
					++pos;
				}
				if (pos < len) {
					s = code.substring(n, pos++);
				} else {
					GmlParser_error("Unclosed string", d1);
					s = null;
				}
				if (s == null) return null;
				out.push(ast_GmlToken_CString(d1, code.substring(start + 1, pos - 1)));
				break;
			case 40: out.push(ast_GmlToken_ParOpen(d1)); break;
			case 41: out.push(ast_GmlToken_ParClose(d1)); break;
			case 42:
				op = 0;
				if (code.charCodeAt(pos) == 61) {
					++pos;
					out.push(ast_GmlToken_SetOp(d1, op));
				} else out.push(ast_GmlToken_BinOp(d1, op));
				break;
			case 43:
				switch (code.charCodeAt(pos)) {
					case 43:
						++pos;
						out.push(ast_GmlToken_Adjfix(d1, true));
						break;
					case 61:
						++pos;
						out.push(ast_GmlToken_SetOp(d1, 16));
						break;
					default: out.push(ast_GmlToken_BinOp(d1, 16));
				}
				break;
			case 44: out.push(ast_GmlToken_Comma(d1)); break;
			case 45:
				switch (code.charCodeAt(pos)) {
					case 45:
						++pos;
						out.push(ast_GmlToken_Adjfix(d1, false));
						break;
					case 61:
						++pos;
						out.push(ast_GmlToken_SetOp(d1, 17));
						break;
					default: out.push(ast_GmlToken_BinOp(d1, 17));
				}
				break;
			case 46:
				c = code.charCodeAt(pos);
				if (c >= 48 && c <= 57) {
					while (true) {
						++pos;
						c = code.charCodeAt(pos);
						if (!(c >= 48 && c <= 57)) break;
					}
					s = code.substring(start, pos);
					out.push(ast_GmlToken_Number(d1, parseFloat(s), s));
				} else out.push(ast_GmlToken_Period(d1));
				break;
			case 47:
				switch (code.charCodeAt(pos)) {
					case 42:
						++pos;
						while (true) {
							c = code.charCodeAt(pos);
							if (c == 10) {
								++row;
								rowStart = pos;
							}
							++pos;
							if (!(pos < len && (c != 42 || code.charCodeAt(pos) != 47))) break;
						}
						i = pos;
						z = true;
						++pos;
						while (++i < len) {
							switch (code.charCodeAt(i)) {
								case 10: case 13: break;
								case 9: case 32: continue;
								default: z = false;
							}
							break;
						}
						break;
					case 47:
						start = ++pos;
						while (pos < len) {
							i = code.charCodeAt(pos);
							if (i == 10 || i == 13) {
								break;
							} else ++pos;
						}
						break;
					case 61:
						++pos;
						out.push(ast_GmlToken_SetOp(d1, 1));
						break;
					default:
						op = 1;
						if (code.charCodeAt(pos) == 61) {
							++pos;
							out.push(ast_GmlToken_SetOp(d1, op));
						} else out.push(ast_GmlToken_BinOp(d1, op));
				}
				break;
			case 58: out.push(ast_GmlToken_Colon(d1)); break;
			case 59: out.push(ast_GmlToken_Semico(d1)); break;
			case 60:
				switch (code.charCodeAt(pos)) {
					case 60:
						++pos;
						op = 32;
						if (code.charCodeAt(pos) == 61) {
							++pos;
							out.push(ast_GmlToken_SetOp(d1, op));
						} else out.push(ast_GmlToken_BinOp(d1, op));
						break;
					case 61:
						++pos;
						out.push(ast_GmlToken_BinOp(d1, 67));
						break;
					case 62:
						++pos;
						op = 65;
						if (code.charCodeAt(pos) == 61) {
							++pos;
							out.push(ast_GmlToken_SetOp(d1, op));
						} else out.push(ast_GmlToken_BinOp(d1, op));
						break;
					default: out.push(ast_GmlToken_BinOp(d1, 66));
				}
				break;
			case 61:
				if (code.charCodeAt(pos) == 61) {
					++pos;
					out.push(ast_GmlToken_BinOp(d1, 64));
				} else out.push(ast_GmlToken_SetOp(d1, -1));
				break;
			case 62:
				switch (code.charCodeAt(pos)) {
					case 61:
						++pos;
						out.push(ast_GmlToken_BinOp(d1, 69));
						break;
					case 62:
						++pos;
						op = 33;
						if (code.charCodeAt(pos) == 61) {
							++pos;
							out.push(ast_GmlToken_SetOp(d1, op));
						} else out.push(ast_GmlToken_BinOp(d1, op));
						break;
					default: out.push(ast_GmlToken_BinOp(d1, 68));
				}
				break;
			case 63: out.push(ast_GmlToken_QMark(d1)); break;
			case 64: out.push(ast_GmlToken_AtSign(d1)); break;
			case 91: out.push(ast_GmlToken_SqbOpen(d1)); break;
			case 93: out.push(ast_GmlToken_SqbClose(d1)); break;
			case 94:
				if (code.charCodeAt(pos) == 94) {
					++pos;
					op = 65;
					if (code.charCodeAt(pos) == 61) {
						++pos;
						out.push(ast_GmlToken_SetOp(d1, op));
					} else out.push(ast_GmlToken_BinOp(d1, op));
				} else {
					op = 50;
					if (code.charCodeAt(pos) == 61) {
						++pos;
						out.push(ast_GmlToken_SetOp(d1, op));
					} else out.push(ast_GmlToken_BinOp(d1, op));
				}
				break;
			case 96:
				start = pos;
				c = code.charCodeAt(pos);
				out.push(ast_GmlToken_ParOpen(d1));
				for (z = false; c != 96 && pos < len; c = code.charCodeAt(pos)) {
					++pos;
					if (c == 10) {
						++row;
						rowStart = pos;
					} else if (c == 36) {
						c = code.charCodeAt(pos);
						if (c == 123) {
							++pos;
							d1 = new ast_GmlPos(src, row, pos - rowStart);
							if (z) {
								out.push(ast_GmlToken_BinOp(d1, 18));
							} else z = true;
							out.push(ast_GmlToken_CString(d1, code.substring(start, pos - 2)));
							GmlParser_temRow = row;
							GmlParser_temRowStart = rowStart;
							tks = GmlParser_run(src, pos);
							if (tks == null) return null;
							row = GmlParser_temRow;
							rowStart = GmlParser_temRowStart;
							pos = GmlParser_temEnd;
							start = pos;
							out.push(ast_GmlToken_BinOp(d1, 18));
							out.push(ast_GmlToken_ParOpen(d1));
							d1 = new ast_GmlPos(src, row, pos - rowStart);
							n = tks.length;
							for (i = 0; i < n; ++i) out.push(tks[i]);
							out.push(ast_GmlToken_ParClose(d1));
						}
					}
				}
				if (pos >= len) {
					return GmlParser_error("Unclosed string", d1);
				} else ++pos;
				d1 = new ast_GmlPos(src, row, pos - rowStart);
				if (z) out.push(ast_GmlToken_BinOp(d1, 18));
				out.push(ast_GmlToken_CString(d1, code.substring(start, pos - 1)));
				out.push(ast_GmlToken_ParClose(d1));
				break;
			case 123:
				++brackets;
				out.push(ast_GmlToken_CubOpen(d1));
				break;
			case 124:
				if (code.charCodeAt(pos) == 124) {
					++pos;
					op = 96;
					if (code.charCodeAt(pos) == 61) {
						++pos;
						out.push(ast_GmlToken_SetOp(d1, op));
					} else out.push(ast_GmlToken_BinOp(d1, op));
				} else {
					op = 48;
					if (code.charCodeAt(pos) == 61) {
						++pos;
						out.push(ast_GmlToken_SetOp(d1, op));
					} else out.push(ast_GmlToken_BinOp(d1, op));
				}
				break;
			case 125:
				--brackets;
				if (temStart >= 0 && brackets < 0) {
					if (temStart >= 0) {
						GmlParser_temEnd = pos;
						GmlParser_temRow = row;
						GmlParser_temRowStart = rowStart;
					}
					return out;
				} else out.push(ast_GmlToken_CubClose(d1));
				break;
			case 126: out.push(ast_GmlToken_UnOp(d1, 2)); break;
			default:
				if (c >= 97 && c <= 122 || c >= 65 && c <= 90 || c == 95) {
					while (pos < len) {
						c = code.charCodeAt(pos);
						if (c == 95 || c >= 97 && c <= 122 || c >= 65 && c <= 90 || c >= 48 && c <= 57) {
							++pos;
						} else break;
					}
					s = code.substring(start, pos);
					switch (s) {
						case "all": out.push(ast_GmlToken_Number(d1, -3, null)); break;
						case "and": out.push(ast_GmlToken_BinOp(d1, 80)); break;
						case "argument": out.push(ast_GmlToken_Keyword(d1, 24)); break;
						case "argument_count": out.push(ast_GmlToken_Keyword(d1, 25)); break;
						case "begin": out.push(ast_GmlToken_CubOpen(d1)); break;
						case "break": out.push(ast_GmlToken_Keyword(d1, 17)); break;
						case "case": out.push(ast_GmlToken_Keyword(d1, 8)); break;
						case "catch": out.push(ast_GmlToken_Keyword(d1, 22)); break;
						case "continue": out.push(ast_GmlToken_Keyword(d1, 16)); break;
						case "debugger": out.push(ast_GmlToken_Keyword(d1, 26)); break;
						case "default": out.push(ast_GmlToken_Keyword(d1, 9)); break;
						case "div": out.push(ast_GmlToken_BinOp(d1, 3)); break;
						case "do": out.push(ast_GmlToken_Keyword(d1, 13)); break;
						case "else": out.push(ast_GmlToken_Keyword(d1, 6)); break;
						case "end": out.push(ast_GmlToken_CubClose(d1)); break;
						case "enum": out.push(ast_GmlToken_Keyword(d1, 3)); break;
						case "exit": out.push(ast_GmlToken_Keyword(d1, 19)); break;
						case "false": out.push(ast_GmlToken_Number(d1, 0, null)); break;
						case "for": out.push(ast_GmlToken_Keyword(d1, 14)); break;
						case "global": out.push(ast_GmlToken_Keyword(d1, 0)); break;
						case "globalvar": out.push(ast_GmlToken_Keyword(d1, 1)); break;
						case "if": out.push(ast_GmlToken_Keyword(d1, 4)); break;
						case "in": out.push(ast_GmlToken_In(d1)); break;
						case "mod": out.push(ast_GmlToken_BinOp(d1, 2)); break;
						case "noone": out.push(ast_GmlToken_Number(d1, -4, null)); break;
						case "not": out.push(ast_GmlToken_UnOp(d1, 1)); break;
						case "null": out.push(ast_GmlToken_Undefined(d1)); break;
						case "or": out.push(ast_GmlToken_BinOp(d1, 96)); break;
						case "repeat": out.push(ast_GmlToken_Keyword(d1, 10)); break;
						case "return": out.push(ast_GmlToken_Keyword(d1, 18)); break;
						case "switch": out.push(ast_GmlToken_Keyword(d1, 7)); break;
						case "then": out.push(ast_GmlToken_Keyword(d1, 5)); break;
						case "throw": out.push(ast_GmlToken_Keyword(d1, 23)); break;
						case "true": out.push(ast_GmlToken_Number(d1, 1, null)); break;
						case "try": out.push(ast_GmlToken_Keyword(d1, 21)); break;
						case "undefined": out.push(ast_GmlToken_Undefined(d1)); break;
						case "until": out.push(ast_GmlToken_Keyword(d1, 12)); break;
						case "var": out.push(ast_GmlToken_Keyword(d1, 2)); break;
						case "while": out.push(ast_GmlToken_Keyword(d1, 11)); break;
						case "with": out.push(ast_GmlToken_Keyword(d1, 15)); break;
						case "xor": out.push(ast_GmlToken_BinOp(d1, 65)); break;
						default:
							if (StringTools_startsWith(s, "argument")) {
								zi = Std_parseInt(s.substring(8));
								if (zi != null) {
									out.push(ast_GmlToken_ArgConst(d1, zi));
								} else out.push(ast_GmlToken_Ident(d1, s));
							} else out.push(ast_GmlToken_Ident(d1, s));
					}
				} else if (c >= 48 && c <= 57 || c == 46) {
					--pos;
					z = false;
					s = null;
					while (pos < len) {
						c = code.charCodeAt(pos);
						if (c == 46) {
							if (z) {
								return GmlParser_error("Extra dot in a number", d1);
							} else {
								++pos;
								c = code.charCodeAt(pos);
								if (c == 95 || c >= 97 && c <= 122 || c >= 65 && c <= 90) {
									s = code.substring(start, pos - 2);
									out.push(ast_GmlToken_Number(d1, parseFloat(s), s));
									d1 = new ast_GmlPos(src, row, pos - rowStart);
									out.push(ast_GmlToken_Period(d1));
									break;
								}
								z = true;
							}
						} else if (c >= 48 && c <= 57) {
							++pos;
						} else break;
					}
					if (s == null) {
						while (code.charCodeAt(start) == 48) {
							++start;
							if (start >= pos) {
								--start;
								break;
							} else if (code.charCodeAt(start) == 46) {
								--start;
								break;
							}
						}
						s = code.substring(start, pos);
						out.push(ast_GmlToken_Number(d1, parseFloat(s), s));
					}
				} else return GmlParser_error("Unexpected character `" + String.fromCharCode(c) + "`", d1);
		}
	}
	if (temStart >= 0) {
		GmlParser_temEnd = pos;
		GmlParser_temRow = row;
		GmlParser_temRowStart = rowStart;
	}
	return out;
}
//}
//{ GmlPrint
function GmlPrint_quoted(s) {
	s = StringTools_replace(s, "\\", "\\\\");
	s = StringTools_replace(s, "\n", "\\n");
	if (s.indexOf('"') < 0) {
		return '"' + s + '"';
	} else if (s.indexOf("'") < 0) {
		return "'" + s + "'";
	} else throw new js__Boot_HaxeError("Can't print `" + s + "`");
}
function GmlPrint_inst(r, q, stack, f) {
	switch (q[1]/* ast.GmlNode */) {
		case 8/* Self */: r.b += Std_string(GmlPrint_self); break;
		case 9/* Other */: r.b += Std_string(GmlPrint_other); break;
		case 33/* Global */: r.b += "global"; break;
		default:
			r.b += "gml$inst(";
			GmlPrint_node(r, q, stack, 2);
			r.b += ")";
	}
}
function GmlPrint_index(r, q, stack, f) {
	if (ast_GmlNodeTools_isInt(q)) {
		GmlPrint_node(r, q, stack, 2);
	} else {
		r.b += "0|";
		GmlPrint_node(r, q, stack, 0);
	}
}
function GmlPrint_node(r, o, stack, flags) {
	stack.unshift(o);
	var tx, i, n, k, s, s2, z, z2, zi, q, q2, w;
	switch (o[1]/* ast.GmlNode */) {
		case 0/* Undefined */: r.b += "undefined"; break;
		case 1/* Number */:
			var v = o[3];
			s = o[4];
			if (s != null) {
				r.b += (s == null) ? "null" : "" + s;
			} else r.b += (v == null) ? "null" : "" + v;
			break;
		case 2/* CString */: r.b += Std_string(GmlPrint_quoted(o[3])); break;
		case 3/* EnumCtr */:
			var c = o[4];
			r.b += Std_string(c.value);
			r.b += "/* ";
			r.b += Std_string(o[3].name);
			r.b += ".";
			r.b += Std_string(c.name);
			r.b += " */";
			break;
		case 4/* ArrayDecl */:
			w = o[3];
			n = w.length;
			r.b += "[";
			if (n > 0) {
				GmlPrint_node(r, w[0], stack, 2);
				for (i = 1; i < n; ++i) {
					r.b += ", ";
					GmlPrint_node(r, w[i], stack, 2);
				}
			}
			r.b += "]";
			break;
		case 5/* ObjectDecl */:
			var kw = o[3];
			w = o[4];
			n = w.length;
			r.b += "{";
			if (n > 0) {
				r.b += " ";
				r.b += Std_string("js$" + kw[0]);
				r.b += ": ";
				GmlPrint_node(r, w[0], stack, 2);
				for (i = 1; i < n; ++i) {
					r.b += ", ";
					r.b += Std_string("js$" + kw[i]);
					r.b += ": ";
					GmlPrint_node(r, w[i], stack, 2);
				}
			}
			r.b += " ";
			r.b += "}";
			r.semicoAfter = r.b.length;
			break;
		case 6/* EnsureArray */:
			var x = o[3];
			r.b += "if (!(";
			GmlPrint_node(r, x, stack, 0);
			r.b += " instanceof Array)) ";
			GmlPrint_node(r, x, stack, 0);
			r.b += " = []";
			break;
		case 8/* Self */:
			r.b += "get$id(";
			r.b += Std_string(GmlPrint_self);
			r.b += ")";
			break;
		case 9/* Other */:
			r.b += "get$id(";
			r.b += Std_string(GmlPrint_other);
			r.b += ")";
			break;
		case 10/* Script */:
			var scr = o[3];
			r.b += Std_string(scr.index);
			r.b += "/* ";
			r.b += Std_string(scr.name);
			r.b += " */";
			break;
		case 11/* Const */:
			s = o[3];
			if (gml_const_val != null) {
				var v2 = gml_const_val[s];
				if (v2.isString()) {
					r.b += Std_string(GmlPrint_quoted(v2.asString()));
				} else if (v2 != null) {
					r.b += Std_string(v2);
					r.b += " /* ";
					r.b += (s == null) ? "null" : "" + s;
					r.b += " */";
				} else r.b += (s == null) ? "null" : "" + s;
			} else r.b += Std_string("gml$" + s);
			break;
		case 12/* ArgConst */:
			var i1 = o[3];
			r.b += "argument";
			r.b += (i1 == null) ? "null" : "" + i1;
			break;
		case 13/* ArgIndex */:
			r.b += "arguments[";
			GmlPrint_index(r, o[3], stack, flags);
			r.b += "]";
			break;
		case 14/* ArgCount */: r.b += "arguments.length"; break;
		case 16/* CallScript */:
			r.b += Std_string("js$" + o[3]);
			r.b += "(";
			r.b += Std_string(GmlPrint_self);
			r.b += ", ";
			r.b += Std_string(GmlPrint_other);
			w = o[4];
			n = w.length;
			for (i = 0; i < n; ++i) {
				r.b += ", ";
				GmlPrint_node(r, w[i], stack, 2);
			}
			r.b += ")";
			break;
		case 17/* CallScriptAt */:
			r.b += Std_string("js$" + o[4]);
			r.b += "(";
			GmlPrint_inst(r, o[3], stack, flags);
			r.b += ", ";
			r.b += Std_string(GmlPrint_self);
			w = o[5];
			n = w.length;
			for (i = 0; i < n; ++i) {
				r.b += ", ";
				GmlPrint_node(r, w[i], stack, 2);
			}
			r.b += ")";
			break;
		case 18/* CallScriptId */:
			r.b += "gml$scripts[";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "](";
			r.b += Std_string(GmlPrint_self);
			r.b += ", ";
			r.b += Std_string(GmlPrint_other);
			w = o[4];
			n = w.length;
			for (i = 0; i < n; ++i) {
				r.b += ", ";
				GmlPrint_node(r, w[i], stack, 2);
			}
			r.b += ")";
			break;
		case 19/* CallField */:
			q = o[3];
			s = o[4];
			if (ast_GmlNodeTools_isSimple(q)) {
				r.b += "gml$scripts[";
				GmlPrint_inst(r, q, stack, flags);
				r.b += ".js$";
				r.b += (s == null) ? "null" : "" + s;
				r.b += "](";
				GmlPrint_inst(r, q, stack, flags);
				r.b += ", ";
				r.b += Std_string(GmlPrint_self);
			} else {
				r.b += "gml$fieldcall(";
				GmlPrint_inst(r, q, stack, flags);
				r.b += ", 'js$";
				r.b += (s == null) ? "null" : "" + s;
				r.b += "', ";
				r.b += Std_string(GmlPrint_self);
			}
			w = o[5];
			n = w.length;
			for (i = 0; i < n; ++i) {
				r.b += ", ";
				GmlPrint_node(r, w[i], stack, 2);
			}
			r.b += ")";
			break;
		case 20/* CallFunc */:
			s = o[3];
			r.b += Std_string("gml$" + s);
			r.b += "(";
			w = o[4];
			n = w.length;
			if (gml_inst_data[s] != null) {
				r.b += Std_string(GmlPrint_self);
				z = true;
			} else z = false;
			for (i = 0; i < n; ++i) {
				if (z) {
					r.b += ", ";
				} else z = true;
				GmlPrint_node(r, w[i], stack, 2);
			}
			r.b += ")";
			break;
		case 21/* CallFuncAt */:
			r.b += Std_string("gml$" + o[4]);
			r.b += "(";
			GmlPrint_inst(r, o[3], stack, flags);
			w = o[5];
			n = w.length;
			for (i = 0; i < n; ++i) {
				r.b += ", ";
				GmlPrint_node(r, w[i], stack, 2);
			}
			r.b += ")";
			break;
		case 22/* Prefix */:
			r.b += (o[4]) ? "++" : "--";
			GmlPrint_node(r, o[3], stack, 0);
			break;
		case 23/* Postfix */:
			GmlPrint_node(r, o[3], stack, 0);
			r.b += (o[4]) ? "++" : "--";
			break;
		case 24/* UnOp */:
			switch (o[4]/* ast.GmlUnOp */) {
				case 0: s = "-"; break;
				case 1: s = "!"; break;
				case 2: s = "~"; break;
			}
			r.b += (s == null) ? "null" : "" + s;
			GmlPrint_node(r, o[3], stack, 0);
			break;
		case 25/* BinOp */:
			var o2 = o[3];
			if ((flags & 2) == 0) r.b += "(";
			if (o2 != 3) {
				GmlPrint_node(r, o[4], stack, 0);
				r.b += " ";
				r.b += Std_string(ast__GmlOp_GmlOp_Impl__toString(o2));
				r.b += " ";
				GmlPrint_node(r, o[5], stack, 0);
			} else {
				r.b += "div(";
				GmlPrint_node(r, o[4], stack, 2);
				r.b += ", ";
				GmlPrint_node(r, o[5], stack, 2);
				r.b += ")";
			}
			if ((flags & 2) == 0) r.b += ")";
			break;
		case 26/* SetOp */:
			GmlPrint_node(r, o[4], stack, 0);
			r.b += " ";
			r.b += Std_string(ast__GmlOp_GmlOp_Impl__toString(o[3]));
			r.b += "= ";
			GmlPrint_node(r, o[5], stack, 0);
			break;
		case 27/* ToBool */:
			if ((flags & 2) == 0) {
				r.b += "(";
				GmlPrint_node(r, o[3], stack, 2);
				r.b += " > 0.5)";
			} else {
				GmlPrint_node(r, o[3], stack, 2);
				r.b += " > 0.5";
			}
			break;
		case 28/* FromBool */:
			if ((flags & 2) == 0) {
				r.b += "(";
				GmlPrint_node(r, o[3], stack, 2);
				r.b += " ? 1 : 0)";
			} else {
				GmlPrint_node(r, o[3], stack, 2);
				r.b += " ? 1 : 0";
			}
			break;
		case 30/* Local */:
			var s9 = o[3];
			r.b += (s9 == null) ? "null" : "" + s9;
			break;
		case 31/* LocalSet */:
			var s10 = o[3];
			r.b += (s10 == null) ? "null" : "" + s10;
			r.b += " = ";
			GmlPrint_node(r, o[4], stack, 2);
			break;
		case 32/* LocalAop */:
			var s11 = o[3];
			r.b += (s11 == null) ? "null" : "" + s11;
			r.b += " ";
			r.b += Std_string(ast__GmlOp_GmlOp_Impl__toString(o[4]));
			r.b += "= ";
			GmlPrint_node(r, o[5], stack, 2);
			break;
		case 33/* Global */:
			r.b += "global.";
			r.b += Std_string("js$" + o[3]);
			break;
		case 34/* GlobalSet */:
			r.b += "global.";
			r.b += Std_string("js$" + o[3]);
			r.b += " = ";
			GmlPrint_node(r, o[4], stack, 2);
			break;
		case 35/* GlobalAop */:
			r.b += "global.";
			r.b += Std_string("js$" + o[3]);
			r.b += " ";
			r.b += Std_string(ast__GmlOp_GmlOp_Impl__toString(o[4]));
			r.b += "= ";
			GmlPrint_node(r, o[5], stack, 2);
			break;
		case 36/* Field */:
			var s17 = o[4];
			GmlPrint_inst(r, o[3], stack, flags);
			r.b += ".";
			r.b += "js$";
			r.b += (s17 == null) ? "null" : "" + s17;
			break;
		case 37/* FieldSet */:
			var s18 = o[4];
			GmlPrint_inst(r, o[3], stack, flags);
			r.b += ".";
			r.b += "js$";
			r.b += (s18 == null) ? "null" : "" + s18;
			r.b += " = ";
			GmlPrint_node(r, o[5], stack, 2);
			break;
		case 38/* FieldAop */:
			var s19 = o[4];
			GmlPrint_inst(r, o[3], stack, flags);
			r.b += ".";
			r.b += "js$";
			r.b += (s19 == null) ? "null" : "" + s19;
			r.b += " ";
			r.b += Std_string(ast__GmlOp_GmlOp_Impl__toString(o[5]));
			r.b += "= ";
			GmlPrint_node(r, o[6], stack, 2);
			break;
		case 39/* Env */:
			s = o[3];
			r.b += "get$";
			r.b += (s == null) ? "null" : "" + s;
			r.b += "(";
			if ((gml_var_flags[s] & 4) != 0) r.b += Std_string(GmlPrint_self);
			r.b += ")";
			break;
		case 40/* EnvSet */:
			s = o[3];
			r.b += "set$";
			r.b += (s == null) ? "null" : "" + s;
			r.b += "(";
			if ((gml_var_flags[s] & 4) != 0) {
				r.b += Std_string(GmlPrint_self);
				r.b += ", ";
			}
			GmlPrint_node(r, o[4], stack, 0);
			r.b += ")";
			break;
		case 41/* EnvAop */:
			var s21 = o[3];
			r.b += "aop$";
			r.b += (s21 == null) ? "null" : "" + s21;
			r.b += "(";
			if ((gml_var_flags[s21] & 4) != 0) {
				r.b += Std_string(GmlPrint_self);
				r.b += ", ";
			}
			r.b += Std_string(ast__GmlOp_GmlOp_Impl__toJS(o[4]));
			r.b += ", ";
			GmlPrint_node(r, o[5], stack, 0);
			r.b += ")";
			break;
		case 42/* EnvFd */:
			var s23 = o[4];
			r.b += "get$";
			r.b += (s23 == null) ? "null" : "" + s23;
			r.b += "(";
			GmlPrint_inst(r, o[3], stack, flags);
			r.b += ")";
			break;
		case 43/* EnvFdSet */:
			var s24 = o[4];
			r.b += "set$";
			r.b += (s24 == null) ? "null" : "" + s24;
			r.b += "(";
			GmlPrint_inst(r, o[3], stack, flags);
			r.b += ", ";
			GmlPrint_node(r, o[5], stack, 0);
			r.b += ")";
			break;
		case 44/* EnvFdAop */:
			var s25 = o[4];
			r.b += "aop$";
			r.b += (s25 == null) ? "null" : "" + s25;
			r.b += "(";
			GmlPrint_inst(r, o[3], stack, flags);
			r.b += ", ";
			r.b += Std_string(ast__GmlOp_GmlOp_Impl__toJS(o[5]));
			r.b += ", ";
			GmlPrint_node(r, o[6], stack, 0);
			r.b += ")";
			break;
		case 45/* Env1d */:
			var s27 = o[3];
			r.b += "get$";
			r.b += (s27 == null) ? "null" : "" + s27;
			r.b += "(";
			GmlPrint_node(r, o[4], stack, 0);
			r.b += ")";
			break;
		case 46/* Env1dSet */:
			var s28 = o[3];
			r.b += "set$";
			r.b += (s28 == null) ? "null" : "" + s28;
			r.b += "(";
			GmlPrint_node(r, o[4], stack, 0);
			r.b += ", ";
			GmlPrint_node(r, o[5], stack, 0);
			r.b += ")";
			break;
		case 47/* Env1dAop */:
			var s29 = o[3];
			r.b += "set$";
			r.b += (s29 == null) ? "null" : "" + s29;
			r.b += "(";
			GmlPrint_node(r, o[4], stack, 0);
			r.b += ", ";
			GmlPrint_node(r, o[6], stack, 0);
			r.b += ")";
			break;
		case 48/* Index */:
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += "]";
			break;
		case 49/* IndexSet */:
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += "] = ";
			GmlPrint_node(r, o[5], stack, 0);
			break;
		case 50/* IndexAop */:
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += "] ";
			r.b += Std_string(ast__GmlOp_GmlOp_Impl__toString(o[5]));
			r.b += "= ";
			GmlPrint_node(r, o[6], stack, 0);
			break;
		case 51/* IndexPrefix */:
			r.b += (o[5]) ? "++" : "--";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_node(r, o[4], stack, 2);
			r.b += "]";
			break;
		case 52/* IndexPostfix */:
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_node(r, o[4], stack, 2);
			r.b += "]";
			r.b += (o[5]) ? "++" : "--";
			break;
		case 53/* Index2d */:
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += "][";
			GmlPrint_index(r, o[5], stack, flags);
			r.b += "]";
			break;
		case 54/* Index2dSet */:
			r.b += "gml$";
			r.b += "array_set_2D";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += ", ";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += ", ";
			GmlPrint_index(r, o[5], stack, flags);
			r.b += ", ";
			GmlPrint_node(r, o[6], stack, 0);
			r.b += ")";
			break;
		case 55/* Index2dAop */:
			r.b += "gml$";
			r.b += "array_aop_2D";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += ", ";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += ", ";
			GmlPrint_index(r, o[5], stack, flags);
			r.b += ", ";
			r.b += Std_string(ast__GmlOp_GmlOp_Impl__toJS(o[6]));
			r.b += ", ";
			GmlPrint_node(r, o[7], stack, 0);
			r.b += ")";
			break;
		case 56/* Index2dPrefix */:
			r.b += (o[6]) ? "++" : "--";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += "][";
			GmlPrint_index(r, o[5], stack, flags);
			r.b += "]";
			break;
		case 57/* Index2dPostfix */:
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += "][";
			GmlPrint_index(r, o[5], stack, flags);
			r.b += "]";
			r.b += (o[6]) ? "++" : "--";
			break;
		case 58/* RawId */:
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += "]";
			break;
		case 59/* RawIdSet */:
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += "] = ";
			GmlPrint_node(r, o[5], stack, 2);
			break;
		case 60/* RawIdAop */:
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += "] ";
			r.b += Std_string(ast__GmlOp_GmlOp_Impl__toString(o[5]));
			r.b += "= ";
			GmlPrint_node(r, o[6], stack, 2);
			break;
		case 63/* RawId2d */:
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += "][";
			GmlPrint_index(r, o[5], stack, flags);
			r.b += "]";
			break;
		case 64/* RawId2dSet */:
			r.b += "gml$";
			r.b += "array_set_2D";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += ", ";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += ", ";
			GmlPrint_index(r, o[5], stack, flags);
			r.b += ", ";
			GmlPrint_node(r, o[6], stack, 0);
			r.b += ")";
			break;
		case 65/* RawId2dAop */:
			r.b += "gml$";
			r.b += "array_aop_2D";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += ", ";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += ", ";
			GmlPrint_index(r, o[5], stack, flags);
			r.b += ", ";
			r.b += Std_string(ast__GmlOp_GmlOp_Impl__toJS(o[6]));
			r.b += ", ";
			GmlPrint_node(r, o[7], stack, 0);
			r.b += ")";
			break;
		case 66/* RawId2dPrefix */:
			r.b += (o[6]) ? "++" : "--";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += "][";
			GmlPrint_index(r, o[5], stack, flags);
			r.b += "]";
			break;
		case 67/* RawId2dPostfix */:
			GmlPrint_node(r, o[3], stack, 0);
			r.b += "[";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += "][";
			GmlPrint_index(r, o[5], stack, flags);
			r.b += "]";
			r.b += (o[6]) ? "++" : "--";
			break;
		case 68/* DsList */:
			r.b += "gml$";
			r.b += "ds_list_find_value";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += ", ";
			GmlPrint_node(r, o[4], stack, 0);
			r.b += ")";
			break;
		case 69/* DsListSet */:
			r.b += "gml$";
			r.b += "ds_list_set";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += ", ";
			GmlPrint_node(r, o[4], stack, 0);
			r.b += ", ";
			GmlPrint_node(r, o[5], stack, 0);
			r.b += ")";
			break;
		case 70/* DsListAop */:
			r.b += "gml$";
			r.b += "ds_list_aop";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ", ";
			GmlPrint_node(r, o[4], stack, 2);
			r.b += ", ";
			r.b += Std_string(ast__GmlOp_GmlOp_Impl__toJS(o[5]));
			r.b += ", ";
			GmlPrint_node(r, o[6], stack, 2);
			r.b += ")";
			break;
		case 71/* DsListPrefix */:
			r.b += "gml$";
			r.b += "ds_list_prefix";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ", ";
			GmlPrint_node(r, o[4], stack, 2);
			r.b += ", ";
			if (o[5]) {
				r.b += "1";
			} else r.b += "-1";
			r.b += ")";
			break;
		case 72/* DsListPostfix */:
			r.b += "gml$";
			r.b += "ds_list_postfix";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ", ";
			GmlPrint_node(r, o[4], stack, 2);
			r.b += ", ";
			if (o[5]) {
				r.b += "1";
			} else r.b += "-1";
			r.b += ")";
			break;
		case 73/* DsMap */:
			r.b += "gml$";
			r.b += "ds_map_find_value";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ", ";
			GmlPrint_node(r, o[4], stack, 2);
			r.b += ")";
			break;
		case 74/* DsMapSet */:
			r.b += "gml$";
			r.b += "ds_map_set";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ", ";
			GmlPrint_node(r, o[4], stack, 2);
			r.b += ", ";
			GmlPrint_node(r, o[5], stack, 2);
			r.b += ")";
			break;
		case 75/* DsMapAop */:
			r.b += "gml$";
			r.b += "ds_map_aop";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ", ";
			GmlPrint_node(r, o[4], stack, 2);
			r.b += ", ";
			r.b += Std_string(ast__GmlOp_GmlOp_Impl__toJS(o[5]));
			r.b += ", ";
			GmlPrint_node(r, o[6], stack, 2);
			r.b += ")";
			break;
		case 76/* DsMapPrefix */:
			r.b += "gml$";
			r.b += "ds_map_prefix";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ", ";
			GmlPrint_node(r, o[4], stack, 2);
			r.b += ", ";
			if (o[5]) {
				r.b += "1";
			} else r.b += "-1";
			r.b += ")";
			break;
		case 77/* DsMapPostfix */:
			r.b += "gml$";
			r.b += "ds_map_postfix";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ", ";
			GmlPrint_node(r, o[4], stack, 2);
			r.b += ", ";
			if (o[5]) {
				r.b += "1";
			} else r.b += "-1";
			r.b += ")";
			break;
		case 78/* DsGrid */:
			r.b += "gml$";
			r.b += "ds_grid_get";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += ", ";
			GmlPrint_node(r, o[4], stack, 0);
			r.b += ", ";
			GmlPrint_node(r, o[5], stack, 0);
			r.b += ")";
			break;
		case 79/* DsGridSet */:
			r.b += "gml$";
			r.b += "ds_grid_set";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += ", ";
			GmlPrint_node(r, o[4], stack, 0);
			r.b += ", ";
			GmlPrint_node(r, o[5], stack, 0);
			r.b += ", ";
			GmlPrint_node(r, o[6], stack, 0);
			r.b += ")";
			break;
		case 80/* DsGridAop */:
			r.b += "gml$";
			r.b += "ds_grid_aop";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ", ";
			GmlPrint_node(r, o[4], stack, 2);
			r.b += ", ";
			GmlPrint_node(r, o[5], stack, 2);
			r.b += ", ";
			r.b += Std_string(ast__GmlOp_GmlOp_Impl__toJS(o[6]));
			r.b += ", ";
			GmlPrint_node(r, o[7], stack, 2);
			r.b += ")";
			break;
		case 81/* DsGridPrefix */:
			r.b += "gml$";
			r.b += "ds_grid_prefix";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ", ";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += ", ";
			GmlPrint_index(r, o[5], stack, flags);
			r.b += ", ";
			if (o[6]) {
				r.b += "1";
			} else r.b += "-1";
			r.b += ")";
			break;
		case 82/* DsGridPostfix */:
			r.b += "gml$";
			r.b += "ds_grid_postfix";
			r.b += "(";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ", ";
			GmlPrint_index(r, o[4], stack, flags);
			r.b += ", ";
			GmlPrint_index(r, o[5], stack, flags);
			r.b += ", ";
			if (o[6]) {
				r.b += "1";
			} else r.b += "-1";
			r.b += ")";
			break;
		case 83/* VarDecl */:
			var v25 = o[4];
			var s37 = o[3];
			r.b += "var ";
			r.b += (s37 == null) ? "null" : "" + s37;
			if (v25 != null) {
				r.b += " = ";
				GmlPrint_node(r, v25, stack, 2);
			}
			break;
		case 84/* Block */:
			w = o[3];
			n = w.length;
			if (n == 1) {
				GmlPrint_node(r, w[0], stack, flags);
			} else if (n == 0) {
				if ((flags & 1) == 0) {
					r.b += "{ ";
					r.b += "}";
					r.semicoAfter = r.b.length;
				}
			} else {
				z2 = (flags & 1) == 0;
				if (z2) {
					r.b += "{";
					r.indent += 1;
					r.addLine();
				}
				z = false;
				i = 0;
				while (i < n) {
					if (z) r.addLine();
					k = r.b.length;
					var _g = w[i];
					if (_g[1] == 83) {
						if (_g[4] == null) {
							var name = _g[3];
							r.b += "var ";
							r.b += (name == null) ? "null" : "" + name;
							while (i + 1 < n) {
								var _g1 = w[i + 1];
								if (_g1[1] == 83) {
									var v26 = _g1[4];
									var name1 = _g1[3];
									if (v26 == null) {
										r.b += ", ";
										r.b += (name1 == null) ? "null" : "" + name1;
										++i;
										continue;
									}
								}
								break;
							}
						} else GmlPrint_node(r, w[i], stack, 5);
					} else GmlPrint_node(r, w[i], stack, 5);
					z = r.b.length > k;
					if (z) {
						if (r.b.length > r.semicoAfter) {
							r.b += ";";
							r.semicoAfter = r.b.length;
						}
					}
					if (w[i][1] == 106) z = false;
					++i;
				}
				if (z2) {
					r.indent -= 1;
					r.addLine();
					r.b += "}";
					r.semicoAfter = r.b.length;
				}
			}
			break;
		case 85/* IfThen */:
			var o17 = o[5];
			if (o17 != null) {
				r.b += "if (";
				GmlPrint_node(r, o[3], stack, 2);
				r.b += ") {";
				r.indent += 1;
				r.addLine();
				GmlPrint_node(r, o[4], stack, 1);
				if (r.b.length > r.semicoAfter) {
					r.b += ";";
					r.semicoAfter = r.b.length;
				}
				r.indent -= 1;
				r.addLine();
				r.b += "}";
				r.semicoAfter = r.b.length;
				r.b += " else ";
				GmlPrint_node(r, o17, stack, 0);
			} else {
				r.b += "if (";
				GmlPrint_node(r, o[3], stack, 2);
				r.b += ") ";
				GmlPrint_node(r, o[4], stack, 0);
			}
			break;
		case 86/* Ternary */:
			if ((flags & 2) == 0) r.b += "(";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += " ? ";
			GmlPrint_node(r, o[4], stack, 0);
			r.b += " : ";
			GmlPrint_node(r, o[5], stack, 0);
			if ((flags & 2) == 0) r.b += ")";
			break;
		case 87/* Switch */:
			var o18 = o[5];
			var m6 = o[4];
			r.b += "switch (";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ") {";
			r.indent += 1;
			n = m6.length;
			for (i = 0; i < n; ++i) {
				var cv = m6[i].values;
				r.addLine();
				r.b += "case ";
				GmlPrint_node(r, cv[0], stack, 2);
				r.b += ":";
				for (k = 1; k < cv.length; ++k) {
					r.b += " case ";
					GmlPrint_node(r, cv[k], stack, 2);
					r.b += ":";
				}
				r.indent += 1;
				r.addLine();
				GmlPrint_node(r, m6[i].expr, stack, 1);
				if (r.b.length > r.semicoAfter) {
					r.b += ";";
					r.semicoAfter = r.b.length;
				}
				r.indent -= 1;
			}
			if (o18 != null) {
				r.addLine();
				r.b += "default:";
				r.indent += 1;
				r.addLine();
				GmlPrint_node(r, o18, stack, 1);
				if (r.b.length > r.semicoAfter) {
					r.b += ";";
					r.semicoAfter = r.b.length;
				}
				r.indent -= 1;
			}
			r.indent -= 1;
			r.addLine();
			r.b += "}";
			r.semicoAfter = r.b.length;
			break;
		case 90/* While */:
			r.b += "while (";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ") ";
			GmlPrint_node(r, o[4], stack, 0);
			break;
		case 91/* DoUntil */:
			r.b += "do ";
			GmlPrint_node(r, o[3], stack, 0);
			if (r.b.length > r.semicoAfter) {
				r.b += ";";
				r.semicoAfter = r.b.length;
			}
			r.b += " while (";
			GmlPrint_node(r, ast_GmlNodeTools_invert(o[4]), stack, 2);
			r.b += ")";
			break;
		case 92/* DoWhile */:
			r.b += "do ";
			GmlPrint_node(r, o[3], stack, 0);
			if (r.b.length > r.semicoAfter) {
				r.b += ";";
				r.semicoAfter = r.b.length;
			}
			r.b += " while (";
			GmlPrint_node(r, o[4], stack, 2);
			r.b += ")";
			break;
		case 93/* Repeat */:
			r.b += "repeat (";
			GmlPrint_node(r, o[3], stack, 2);
			r.b += ") ";
			GmlPrint_node(r, o[4], stack, 0);
			break;
		case 94/* For */:
			r.b += "for (";
			GmlPrint_node(r, o[3], stack, 0);
			if (r.b.length > r.semicoAfter) {
				r.b += ";";
				r.semicoAfter = r.b.length;
			}
			r.b += " ";
			GmlPrint_node(r, o[4], stack, 2);
			if (r.b.length > r.semicoAfter) {
				r.b += ";";
				r.semicoAfter = r.b.length;
			}
			r.b += " ";
			GmlPrint_node(r, o[5], stack, 0);
			r.b += ") ";
			GmlPrint_node(r, o[6], stack, 0);
			break;
		case 95/* With */:
			q = o[3];
			q2 = o[4];
			switch (q[1]/* ast.GmlNode */) {
				case 8/* Self */: GmlPrint_node(r, q2, stack, flags); break;
				case 9/* Other */:
					s = GmlPrint_self;
					GmlPrint_self = GmlPrint_other;
					GmlPrint_other = s;
					GmlPrint_node(r, q2, stack, flags);
					s = GmlPrint_self;
					GmlPrint_self = GmlPrint_other;
					GmlPrint_other = s;
					break;
				default:
					if ((flags & 1) == 0) {
						r.b += "{";
						r.indent += 1;
						r.addLine();
					}
					var w1 = new tools_GmlBuffer();
					GmlPrint_node(w1, q, stack, 2);
					GmlPrint_withDepth++;
					s = GmlPrint_other;
					GmlPrint_other = GmlPrint_self;
					GmlPrint_self = "gml$self" + GmlPrint_withDepth;
					var w2 = new tools_GmlBuffer();
					GmlPrint_node(w2, q2, stack, 1);
					r.b += Std_string(gml_with_func(GmlPrint_withDepth, StringTools_rpad("", "\t", w1.indent), "\t", w1.b, w2.b));
					GmlPrint_self = GmlPrint_other;
					GmlPrint_other = s;
					GmlPrint_withDepth--;
					if ((flags & 1) == 0) {
						r.indent -= 1;
						r.addLine();
						r.b += "}";
						r.semicoAfter = r.b.length;
					}
			}
			break;
		case 96/* Once */:
			r.b += "once(";
			GmlPrint_node(r, o[3], stack, 0);
			r.b += ")";
			break;
		case 97/* Return */:
			r.b += "return ";
			GmlPrint_node(r, o[3], stack, 2);
			break;
		case 98/* Exit */: r.b += "return 0"; break;
		case 99/* Break */: r.b += "break"; break;
		case 100/* Continue */: r.b += "continue"; break;
		case 101/* Debugger */: r.b += "debugger"; break;
		case 102/* TryCatch */:
			var s42 = o[4];
			r.b += "try {";
			r.indent += 1;
			r.addLine();
			r.semicoAfter = r.b.length;
			GmlPrint_node(r, o[3], stack, 1);
			if (r.b.length > r.semicoAfter) {
				r.b += ";";
				r.semicoAfter = r.b.length;
			}
			r.indent -= 1;
			r.addLine();
			r.b += "}";
			r.semicoAfter = r.b.length;
			r.b += " catch (";
			r.b += (s42 == null) ? "null" : "" + s42;
			r.b += ") {";
			r.indent += 1;
			r.addLine();
			r.b += "if (";
			r.b += (s42 == null) ? "null" : "" + s42;
			r.b += " instanceof Error) ";
			r.b += (s42 == null) ? "null" : "" + s42;
			r.b += " = ";
			r.b += (s42 == null) ? "null" : "" + s42;
			r.b += ".toString()";
			if (r.b.length > r.semicoAfter) {
				r.b += ";";
				r.semicoAfter = r.b.length;
			}
			r.addLine();
			r.semicoAfter = r.b.length;
			GmlPrint_node(r, o[5], stack, 1);
			if (r.b.length > r.semicoAfter) {
				r.b += ";";
				r.semicoAfter = r.b.length;
			}
			r.indent -= 1;
			r.addLine();
			r.b += "}";
			r.semicoAfter = r.b.length;
			break;
		case 103/* Throw */:
			r.b += "throw ";
			GmlPrint_node(r, o[3], stack, 2);
			break;
		case 104/* CommentLine */:
			var s43 = o[3];
			r.b += "//";
			r.b += (s43 == null) ? "null" : "" + s43;
			r.semicoAfter = r.b.length;
			break;
		case 105/* CommentLinePre */:
			var s44 = o[3];
			r.b += "//";
			r.b += (s44 == null) ? "null" : "" + s44;
			r.addLine();
			GmlPrint_node(r, o[4], stack, flags);
			break;
		case 106/* CommentLinePost */:
			var s45 = o[4];
			z = (flags & 4) != 0;
			GmlPrint_node(r, o[3], stack, flags);
			if (z) {
				if (r.b.length > r.semicoAfter) {
					r.b += ";";
					r.semicoAfter = r.b.length;
				}
			}
			r.b += " //";
			r.b += (s45 == null) ? "null" : "" + s45;
			r.addLine();
			r.semicoAfter = r.b.length;
			if (!z) r.addLine();
			break;
		case 107/* CommentLineSep */:
			var s46 = o[3];
			r.addLine();
			r.b += "//";
			r.b += (s46 == null) ? "null" : "" + s46;
			r.addLine();
			GmlPrint_node(r, o[4], stack, flags);
			break;
		case 108/* CommentBlock */:
			var s47 = o[3];
			r.b += "/*";
			r.b += (s47 == null) ? "null" : "" + s47;
			r.b += "*/";
			r.semicoAfter = r.b.length;
			break;
		case 109/* CommentBlockPre */:
			var s48 = o[3];
			r.b += "/*";
			r.b += (s48 == null) ? "null" : "" + s48;
			r.b += "*/ ";
			GmlPrint_node(r, o[4], stack, 0);
			break;
		case 110/* CommentBlockPost */:
			var s49 = o[4];
			GmlPrint_node(r, o[3], stack, 0);
			r.b += " /*";
			r.b += (s49 == null) ? "null" : "" + s49;
			r.b += "*/";
			break;
		default:
			r.b += "@";
			r.b += Std_string(o[0]);
	}
	stack.shift();
}
function GmlPrint_scriptHeadJS(r, scr) {
	r.b += "function js$";
	r.b += Std_string(scr.name);
	r.b += "(self, other";
	var i = 0;
	for (var _g = scr.arguments; i < _g; i++) {
		r.b += ", argument";
		r.b += (i == null) ? "null" : "" + i;
	}
	r.b += ") ";
	r.indent += 1;
	r.b += "{";
	r.addLine();
}
function GmlPrint_scriptFunc(r, scr) {
	var _ps = GmlPrint_printScript;
	GmlPrint_printScript = scr;
	GmlPrint_self = "self";
	GmlPrint_other = "other";
	GmlPrint_withDepth = 0;
	GmlPrint_scriptHeadJS(r, scr);
	r.semicoAfter = r.b.length;
	GmlPrint_node(r, scr.node, [], 1);
	if (r.b.length > r.semicoAfter) {
		r.b += ";";
		r.semicoAfter = r.b.length;
	}
	r.indent -= 1;
	r.addLine();
	r.b += "}";
	r.semicoAfter = r.b.length;
	GmlPrint_printScript = _ps;
}
function GmlPrint_program(pg) {
	var _pg = GmlPrint_printProgram;
	GmlPrint_printProgram = pg;
	var r = new tools_GmlBuffer();
	var i;
	var scripts = pg.scripts;
	for (i = 0; i < scripts.length; ++i) {
		GmlPrint_scriptFunc(r, scripts[i]);
		r.addLine();
	}
	r.b += "var gml$scripts = [";
	for (i = 0; i < scripts.length; ++i) {
		if (i > 0) r.b += ", ";
		r.b += "js$";
		r.b += Std_string(scripts[i].name);
	}
	r.b += "]";
	if (r.b.length > r.semicoAfter) {
		r.b += ";";
		r.semicoAfter = r.b.length;
	}
	r.addLine();
	var s = r.b;
	GmlPrint_printProgram = _pg;
	return s;
}
//}
//{ GmlProgram
function GmlProgram(sources) {
	this.isReady = false;
	this.errorText = null;
	this.macros = Object.create(null);
	this.enumMap = Object.create(null);
	this.enums = [];
	this.scriptMap = Object.create(null);
	this.scripts = [];
	this.sources = null;
	this.sources = sources;
	var builders = [];
	var _g = 0;
	while (_g < sources.length) {
		var src = sources[_g];
		++_g;
		var b = new GmlBuilder(src);
		builders.push(b);
		if (b.errorText == null) {
			var main = src.main;
			var _g1 = 0;
			var _g2 = b.scripts;
			while (_g1 < _g2.length) {
				var scr = _g2[_g1];
				++_g1;
				if (this.scriptMap[scr.name] != null) {
					if (scr.name == main) {
						var node = this.scriptMap[main].node;
						if (node[1] == 84 && node[3].length == 0) {
							HxOverrides_remove(this.scripts, this.scriptMap[main]);
							this.scripts.push(scr);
							this.scriptMap[scr.name] = scr;
						} else {
							this.error('Cannot override prefix-script "' + main + '" because it is not empty', scr.pos);
							return;
						}
					} else {
						this.error("Script " + scr.name + " is already defined.", scr.pos);
						return;
					}
				} else {
					this.scripts.push(scr);
					this.scriptMap[scr.name] = scr;
				}
			}
			var _g11 = 0;
			var _g21 = b.enums;
			while (_g11 < _g21.length) {
				var e = _g21[_g11];
				++_g11;
				this.enums.push(e);
				this.enumMap[e.name] = e;
			}
			var mcrNames = b.macroNames;
			var mcrNodes = b.macroNodes;
			var mcrMap = this.macros;
			var i = 0;
			for (var _g12 = mcrNames.length; i < _g12; i++) mcrMap[mcrNames[i]] = mcrNodes[i];
		} else {
			this.errorText = b.errorText;
			this.errorPos = b.errorPos;
			return;
		}
	}
	var i1;
	var n = this.scripts.length;
	for (i1 = 0; i1 < n; ++i1) this.scripts[i1].index = i1;
	n = builders.length;
	for (i1 = 0; i1 < n; ++i1) if (builders[i1].postcheck()) break;
	if (i1 >= n && this.check()) {
		GmlProgram_seekInst = null;
		return;
	}
	this.isReady = true;
}
GmlProgram.prototype = {
	error: function(text, d) {
		if (1) throw new js__Boot_HaxeError("!");
		var pos = d;
		this.errorText = pos.toString() + " " + text;
		this.errorPos = pos;
		return true;
	}, 
	seek: function(f, st) {
		if (st == null) st = false;
		var w;
		if (st) {
			w = [];
		} else w = null;
		GmlProgram_seekFunc = f;
		var m = this.scripts;
		var n = m.length;
		var i = 0;
		while (i < n) {
			var scr = m[i];
			GmlProgram_seekScript = scr;
			if (f(scr.node, w)) {
				break;
			} else ++i;
		}
		GmlProgram_seekScript = null;
		GmlProgram_seekFunc = null;
		var st1 = st;
		return i < n;
	}, 
	check: function() {
		GmlProgram_seekInst = this;
		if (this.seek(gml_SeekArguments_proc, false)) return true;
		if (this.seek(gml_SeekLocals_proc, false)) return true;
		if (this.seek(gml_SeekIdents_proc, true)) return true;
		if (this.seek(gml_SeekCalls_proc, false)) return true;
		if (gml_SeekEnumValues_proc()) return true;
		if (this.seek(gml_SeekEnumFields_proc, false)) return true;
		if (this.seek(gml_SeekRepeat_proc, true)) return true;
		if (gml_SeekEval_opt()) return true;
		if (this.seek(gml_SeekBool_proc, true)) return true;
		if (this.seek(gml_SeekSelfFields_proc, false)) return true;
		if (this.seek(gml_SeekAdjfix_proc, true)) return true;
		if (this.seek(gml_SeekSetOp_proc, true)) return true;
		if (this.seek(gml_SeekMergeBlocks_proc, true)) return true;
		if (gml_with_func == null) {
			if (this.seek(gml_SeekAlertWith_proc, false)) return true;
		}
		GmlProgram_seekInst = null;
		return false;
	}
}
//}
//{ GmlWeb
function GmlWeb_editorRef() {
	return window["editor"];
}
function GmlWeb_get_code() {
	var e = GmlWeb_editorRef();
	if (e != null) {
		return e.getValue();
	} else return GmlWeb_editorArea.value;
}
function GmlWeb_removeScript() {
	if (GmlWeb_gameScript != null) {
		if (GmlWeb_gameScript.parentElement != null) GmlWeb_gameScript.parentElement.removeChild(GmlWeb_gameScript);
		GmlWeb_gameScript = null;
	}
}
function GmlWeb_addScript() {
	var wait = GmlWeb_gameFrame.contentWindow.setInterval(function() {
		var q = GmlWeb_gameFrame.contentWindow;
		if (q["mark_avail"]) {
			GmlWeb_gameFrame.contentWindow.clearInterval(wait);
			if (GmlWeb_gameScript != null) GmlWeb_gameFrame.contentDocument.body.appendChild(GmlWeb_gameScript);
			if (gml_const_val == null) {
				gml_const_val = q["gml$constVal"];
				gml_with_func = q["gml$withFunc"];
				gml_asset_ac = q["gml$asset_ac"];
				gml_asset_kind = q["gml$asset_kind"];
				gml_asset_index = q["gml$asset_index"];
				var e = GmlWeb_editorRef();
				if (e != null) e.getSession().bgTokenizer.start(0);
			}
		}
	}, 100);
}
function GmlWeb_runGame(reload, s) {
	if (s == null) s = null;
	GmlWeb_removeScript();
	if (s == null) {
		s = GmlWeb_get_code();
		s = StringTools_replace(s, "\r\n", "\n");
		var ls = window.localStorage;
		if (ls != null) {
			ls.setItem("gmlpen-code", s);
			ls.setItem("gmlpen-mode", GmlWeb_gameMode.value);
		}
	}
	var program = new GmlProgram([new ast_GmlSource("main", s)]);
	var eref = GmlWeb_editorRef();
	var ecs = null;
	if (eref != null) tools__AceWrap_AceWrap_Impl__resetHintError(eref);
	if (program.errorText == null) {
		if (eref != null) tools__AceWrap_AceWrap_Impl__setHintText(eref, "Compiled at " + (new Date).toLocaleTimeString());
		GmlWeb_gameScript = document.createElement("script");
		GmlWeb_gameScript.type = "text/javascript";
		var rjs = GmlPrint_program(program);
		rjs += "gml$game_start();\n";
		GmlWeb_gameScript.innerHTML = rjs;
		console.log(rjs);
		if (reload) {
			GmlWeb_gameFrame.onload = null;
			GmlWeb_gameFrame.src = "about:blank";
			GmlWeb_gameFrame.onload = function(_) {
				GmlWeb_gameFrame.onload = null;
				GmlWeb_addScript();
			}
			var mode = GmlWeb_gameMode.value;
			if (mode == null || mode == "") mode = "2d";
			GmlWeb_gameFrame.src = "./" + mode + "/index.html";
		} else GmlWeb_addScript();
	} else if (eref != null) {
		tools__AceWrap_AceWrap_Impl__setHintError(eref, program.errorText, program.errorPos);
	} else window.alert(program.errorText);
}
function GmlWeb_main() {
	var location = window.location;
	GmlWeb_path = location.origin + location.pathname;
	GmlWeb_gameFrame = document.getElementById("game");
	var tmp;
	if (window.searchParams) {
		tmp = true;
	} else tmp = Object.create(null);
	GmlWeb_params = tmp;
	GmlWeb_gameMode = document.getElementById("mode");
	GmlWeb_gameMode.onchange = function(_) {
		gml_const_val = null;
		GmlWeb_runGame(true, "");
	}
	GmlWeb_editorArea = document.getElementById("source");
	GmlWeb_runGame(true, "");
	window.addEventListener("keydown", function(e) {
		if (e.keyCode == 116 || e.keyCode == 13 && e.ctrlKey) {
			GmlWeb_runGame(false);
			e.preventDefault();
			e.stopPropagation();
		}
	});
	document.getElementById("refresh").onclick = function(_1) {
		GmlWeb_runGame(false);
	}
	document.getElementById("reload").onclick = function(_2) {
		GmlWeb_runGame(true);
	}
	document.getElementById("stop").onclick = function(_3) {
		GmlWeb_gameFrame.contentWindow["gml$game_end"]();
	}
}
//}
//{ HxOverrides
function HxOverrides_cca(s, index) {
	var x = s.charCodeAt(index);
	if (x != x) return undefined;
	return x;
}
function HxOverrides_substr(s, pos, len) {
	if (len == null) len = null;
	if (len == null) {
		len = s.length;
	} else if (len < 0) {
		if (pos == 0) {
			len = s.length + len;
		} else return "";
	}
	return s.substr(pos, len);
}
function HxOverrides_remove(a, obj) {
	var i = a.indexOf(obj);
	if (i == -1) return false;
	a.splice(i, 1);
	return true;
}
//}
//{ SfEnumTools
function SfEnumTools_setTo(q, v) {
	var qx = q;
	var vx = v;
	var qn = qx.length;
	var vn = vx.length;
	if (qn > vn) qx.splice(vn, qn - vn);
	var i = 0;
	for (var _g = vn; i < _g; i++) qx[i] = vx[i];
}
//}
//{ Std
function Std_string(s) {
	return js_Boot___string_rec(s, "");
}
function Std_parseInt(x) {
	var i = parseInt(x, 10);
	if (i == 0) {
		var c1 = HxOverrides_cca(x, 1);
		if (c1 == 120 || c1 == 88) i = parseInt(x);
	}
	if (isNaN(i)) return null;
	return i;
}
//}
//{ StringBuf
function StringBuf() {
	this.b = "";
}
//}
//{ StringTools
function StringTools_startsWith(s, start) {
	return s.length >= start.length && HxOverrides_substr(s, 0, start.length) == start;
}
function StringTools_isSpace(s, pos) {
	var c = HxOverrides_cca(s, pos);
	return (c > 8 && c < 14) || c == 32;
}
function StringTools_ltrim(s) {
	var l = s.length;
	var r = 0;
	while (r < l && StringTools_isSpace(s, r)) {
		++r;
	}
	if (r > 0) {
		return HxOverrides_substr(s, r, l - r);
	} else return s;
}
function StringTools_rtrim(s) {
	var l = s.length;
	var r = 0;
	while (r < l && StringTools_isSpace(s, l - r - 1)) {
		++r;
	}
	if (r > 0) {
		return HxOverrides_substr(s, 0, l - r);
	} else return s;
}
function StringTools_trim(s) {
	return StringTools_ltrim(StringTools_rtrim(s));
}
function StringTools_rpad(s, c, l) {
	if (c.length <= 0) return s;
	while (s.length < l) {
		s += c;
	}
	return s;
}
function StringTools_replace(s, sub, by) {
	return s.split(sub).join(by);
}
//}
//{ ast.GmlEnum
function ast_GmlEnum(name, pos) {
	this.ctrMap = Object.create(null);
	this.ctrList = [];
	this.name = name;
	this.pos = pos;
}
//}
//{ ast.GmlEnumCtr
function ast_GmlEnumCtr(name, pos, node) {
	this.name = name;
	this.pos = pos;
	this.node = node;
}
//}
//{ ast.GmlNode
var ast_GmlNode = { __ename__: true }
function ast_GmlNode_Undefined(d) {
	var r = ["Undefined", 0, d];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Number(d, value, src) {
	var r = ["Number", 1, d, value, src];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CString(d, value) {
	var r = ["CString", 2, d, value];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_EnumCtr(d, e, ctr) {
	var r = ["EnumCtr", 3, d, e, ctr];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_ArrayDecl(d, values) {
	var r = ["ArrayDecl", 4, d, values];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_ObjectDecl(d, keys, values) {
	var r = ["ObjectDecl", 5, d, keys, values];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_EnsureArray(d, expr) {
	var r = ["EnsureArray", 6, d, expr];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Ident(d, id) {
	var r = ["Ident", 7, d, id];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Self(d) {
	var r = ["Self", 8, d];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Other(d) {
	var r = ["Other", 9, d];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Script(d, ref) {
	var r = ["Script", 10, d, ref];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Const(d, id) {
	var r = ["Const", 11, d, id];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_ArgConst(d, id) {
	var r = ["ArgConst", 12, d, id];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_ArgIndex(d, id) {
	var r = ["ArgIndex", 13, d, id];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_ArgCount(d) {
	var r = ["ArgCount", 14, d];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Call(d, x, args) {
	var r = ["Call", 15, d, x, args];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CallScript(d, name, args) {
	var r = ["CallScript", 16, d, name, args];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CallScriptAt(d, inst, script, args) {
	var r = ["CallScriptAt", 17, d, inst, script, args];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CallScriptId(d, index, args) {
	var r = ["CallScriptId", 18, d, index, args];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CallField(d, inst, prop, args) {
	var r = ["CallField", 19, d, inst, prop, args];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CallFunc(d, s, args) {
	var r = ["CallFunc", 20, d, s, args];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CallFuncAt(d, x, s, args) {
	var r = ["CallFuncAt", 21, d, x, s, args];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Prefix(d, x, inc) {
	var r = ["Prefix", 22, d, x, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Postfix(d, x, inc) {
	var r = ["Postfix", 23, d, x, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_UnOp(d, x, o) {
	var r = ["UnOp", 24, d, x, o];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_BinOp(d, o, a, b) {
	var r = ["BinOp", 25, d, o, a, b];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_SetOp(d, o, a, b) {
	var r = ["SetOp", 26, d, o, a, b];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_ToBool(d, v) {
	var r = ["ToBool", 27, d, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_FromBool(d, v) {
	var r = ["FromBool", 28, d, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_In(d, fd, val, not) {
	var r = ["In", 29, d, fd, val, not];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Local(d, id) {
	var r = ["Local", 30, d, id];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_LocalSet(d, id, val) {
	var r = ["LocalSet", 31, d, id, val];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_LocalAop(d, id, op, val) {
	var r = ["LocalAop", 32, d, id, op, val];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Global(d, id) {
	var r = ["Global", 33, d, id];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_GlobalSet(d, id, val) {
	var r = ["GlobalSet", 34, d, id, val];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_GlobalAop(d, id, op, val) {
	var r = ["GlobalAop", 35, d, id, op, val];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Field(d, x, fd) {
	var r = ["Field", 36, d, x, fd];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_FieldSet(d, x, fd, val) {
	var r = ["FieldSet", 37, d, x, fd, val];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_FieldAop(d, x, fd, op, val) {
	var r = ["FieldAop", 38, d, x, fd, op, val];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Env(d, id) {
	var r = ["Env", 39, d, id];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_EnvSet(d, id, val) {
	var r = ["EnvSet", 40, d, id, val];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_EnvAop(d, id, op, val) {
	var r = ["EnvAop", 41, d, id, op, val];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_EnvFd(d, x, fd) {
	var r = ["EnvFd", 42, d, x, fd];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_EnvFdSet(d, x, fd, v) {
	var r = ["EnvFdSet", 43, d, x, fd, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_EnvFdAop(d, x, fd, op, v) {
	var r = ["EnvFdAop", 44, d, x, fd, op, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Env1d(d, id, k) {
	var r = ["Env1d", 45, d, id, k];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Env1dSet(d, id, k, val) {
	var r = ["Env1dSet", 46, d, id, k, val];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Env1dAop(d, id, k, op, val) {
	var r = ["Env1dAop", 47, d, id, k, op, val];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Index(d, x, id) {
	var r = ["Index", 48, d, x, id];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_IndexSet(d, x, id, v) {
	var r = ["IndexSet", 49, d, x, id, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_IndexAop(d, x, id, o, v) {
	var r = ["IndexAop", 50, d, x, id, o, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_IndexPrefix(d, x, i, inc) {
	var r = ["IndexPrefix", 51, d, x, i, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_IndexPostfix(d, x, i, inc) {
	var r = ["IndexPostfix", 52, d, x, i, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Index2d(d, x, i1, i2) {
	var r = ["Index2d", 53, d, x, i1, i2];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Index2dSet(d, x, i1, i2, v) {
	var r = ["Index2dSet", 54, d, x, i1, i2, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Index2dAop(d, x, i1, i2, o, v) {
	var r = ["Index2dAop", 55, d, x, i1, i2, o, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Index2dPrefix(d, x, i, k, inc) {
	var r = ["Index2dPrefix", 56, d, x, i, k, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Index2dPostfix(d, x, i, k, inc) {
	var r = ["Index2dPostfix", 57, d, x, i, k, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_RawId(d, x, id) {
	var r = ["RawId", 58, d, x, id];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_RawIdSet(d, x, id, v) {
	var r = ["RawIdSet", 59, d, x, id, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_RawIdAop(d, x, id, o, v) {
	var r = ["RawIdAop", 60, d, x, id, o, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_RawIdPrefix(d, x, i, inc) {
	var r = ["RawIdPrefix", 61, d, x, i, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_RawIdPostfix(d, x, i, inc) {
	var r = ["RawIdPostfix", 62, d, x, i, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_RawId2d(d, x, i1, i2) {
	var r = ["RawId2d", 63, d, x, i1, i2];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_RawId2dSet(d, x, i1, i2, v) {
	var r = ["RawId2dSet", 64, d, x, i1, i2, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_RawId2dAop(d, x, i1, i2, o, v) {
	var r = ["RawId2dAop", 65, d, x, i1, i2, o, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_RawId2dPrefix(d, x, i, k, inc) {
	var r = ["RawId2dPrefix", 66, d, x, i, k, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_RawId2dPostfix(d, x, i, k, inc) {
	var r = ["RawId2dPostfix", 67, d, x, i, k, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsList(d, lx, id) {
	var r = ["DsList", 68, d, lx, id];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsListSet(d, lx, id, v) {
	var r = ["DsListSet", 69, d, lx, id, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsListAop(d, lx, id, o, v) {
	var r = ["DsListAop", 70, d, lx, id, o, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsListPrefix(d, x, i, inc) {
	var r = ["DsListPrefix", 71, d, x, i, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsListPostfix(d, x, i, inc) {
	var r = ["DsListPostfix", 72, d, x, i, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsMap(d, lx, id) {
	var r = ["DsMap", 73, d, lx, id];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsMapSet(d, lx, id, v) {
	var r = ["DsMapSet", 74, d, lx, id, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsMapAop(d, lx, id, o, v) {
	var r = ["DsMapAop", 75, d, lx, id, o, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsMapPrefix(d, x, i, inc) {
	var r = ["DsMapPrefix", 76, d, x, i, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsMapPostfix(d, x, i, inc) {
	var r = ["DsMapPostfix", 77, d, x, i, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsGrid(d, lx, i1, i2) {
	var r = ["DsGrid", 78, d, lx, i1, i2];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsGridSet(d, lx, i1, i2, v) {
	var r = ["DsGridSet", 79, d, lx, i1, i2, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsGridAop(d, lx, i1, i2, o, v) {
	var r = ["DsGridAop", 80, d, lx, i1, i2, o, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsGridPrefix(d, x, i, k, inc) {
	var r = ["DsGridPrefix", 81, d, x, i, k, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DsGridPostfix(d, x, i, k, inc) {
	var r = ["DsGridPostfix", 82, d, x, i, k, inc];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_VarDecl(d, name, value) {
	var r = ["VarDecl", 83, d, name, value];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Block(d, nodes) {
	var r = ["Block", 84, d, nodes];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_IfThen(d, cond, then, not) {
	var r = ["IfThen", 85, d, cond, then, not];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Ternary(d, cond, then, not) {
	var r = ["Ternary", 86, d, cond, then, not];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Switch(d, expr, list, def) {
	var r = ["Switch", 87, d, expr, list, def];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Wait(d, time) {
	var r = ["Wait", 88, d, time];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Fork(d) {
	var r = ["Fork", 89, d];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_While(d, cond, node) {
	var r = ["While", 90, d, cond, node];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DoUntil(d, node, cond) {
	var r = ["DoUntil", 91, d, node, cond];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_DoWhile(d, node, cond) {
	var r = ["DoWhile", 92, d, node, cond];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Repeat(d, times, node) {
	var r = ["Repeat", 93, d, times, node];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_For(d, pre, cond, post, loop) {
	var r = ["For", 94, d, pre, cond, post, loop];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_With(d, ctx, node) {
	var r = ["With", 95, d, ctx, node];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Once(d, node) {
	var r = ["Once", 96, d, node];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Return(d, v) {
	var r = ["Return", 97, d, v];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Exit(d) {
	var r = ["Exit", 98, d];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Break(d) {
	var r = ["Break", 99, d];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Continue(d) {
	var r = ["Continue", 100, d];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Debugger(d) {
	var r = ["Debugger", 101, d];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_TryCatch(d, node, cap, cat) {
	var r = ["TryCatch", 102, d, node, cap, cat];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_Throw(d, x) {
	var r = ["Throw", 103, d, x];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CommentLine(d, s) {
	var r = ["CommentLine", 104, d, s];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CommentLinePre(d, s, x) {
	var r = ["CommentLinePre", 105, d, s, x];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CommentLinePost(d, x, s) {
	var r = ["CommentLinePost", 106, d, x, s];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CommentLineSep(d, s, x) {
	var r = ["CommentLineSep", 107, d, s, x];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CommentBlock(d, s) {
	var r = ["CommentBlock", 108, d, s];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CommentBlockPre(d, s, x, pl) {
	var r = ["CommentBlockPre", 109, d, s, x, pl];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlNode_CommentBlockPost(d, x, s, pl) {
	var r = ["CommentBlockPost", 110, d, x, s, pl];
	r.__enum__ = ast_GmlNode;
	r.toString = sfjs_toString;
	return r;
}
//}
//{ ast.GmlNodeTools
function ast_GmlNodeTools_unpack(q) {
	while (q != null) {
		if (q[1] == 84) {
			if (q[3].length == 1) {
				q = q[3][0];
			} else return q;
		} else return q;
	}
	return q;
}
function ast_GmlNodeTools_isSimple(q) {
	var i, n, w;
	switch (q[1]/* ast.GmlNode */) {
		case 0/* Undefined */: return true;
		case 1/* Number */: return true;
		case 2/* CString */: return true;
		case 4/* ArrayDecl */:
			w = q[3];
			n = w.length;
			i = 0;
			while (i < n) {
				if (ast_GmlNodeTools_isSimple(w[i])) {
					++i;
				} else break;
			}
			return i >= n;
		case 5/* ObjectDecl */:
			w = q[4];
			n = w.length;
			i = 0;
			while (i < n) {
				if (ast_GmlNodeTools_isSimple(w[i])) {
					++i;
				} else break;
			}
			return i >= n;
		case 8/* Self */: return true;
		case 9/* Other */: return true;
		case 30/* Local */: return true;
		case 33/* Global */: return true;
		case 36/* Field */: return ast_GmlNodeTools_isSimple(q[3]);
		case 48/* Index */: return ast_GmlNodeTools_isSimple(q[3]) && ast_GmlNodeTools_isSimple(q[4]);
		default: return false;
	}
}
function ast_GmlNodeTools_isStatement(q) {
	switch (q[1]/* ast.GmlNode */) {
		case 15/* Call */: return true;
		case 22/* Prefix */: return true;
		case 23/* Postfix */: return true;
		case 26/* SetOp */: return true;
		case 83/* VarDecl */: return true;
		default: return false;
	}
}
function ast_GmlNodeTools_isInBlock(q, p) {
	if (p == null) return false;
	switch (p[1]/* ast.GmlNode */) {
		case 84/* Block */: return true;
		case 85/* IfThen */: return q != p[3];
		case 87/* Switch */: return q != p[3];
		case 90/* While */: return q != p[3];
		case 91/* DoUntil */: return q != p[4];
		case 92/* DoWhile */: return q != p[4];
		case 93/* Repeat */: return q != p[3];
		case 94/* For */: return q != p[4];
		default: return false;
	}
}
function ast_GmlNodeTools_offset(q, i) {
	var d = q[2];
	if (q[1] == 1) return ast_GmlNode_Number(q[2], q[3] + i, null);
	if (i < 0) {
		return ast_GmlNode_BinOp(d, 17, ast_GmlNodeTools_clone(q), ast_GmlNode_Number(d, -i, null));
	} else return ast_GmlNode_BinOp(d, 16, ast_GmlNodeTools_clone(q), ast_GmlNode_Number(d, i, null));
}
function ast_GmlNodeTools_invert(q) {
	switch (q[1]/* ast.GmlNode */) {
		case 1/* Number */:
			switch (q[3]) {
				case 0: return ast_GmlNode_Number(q[2], 1, null);
				case 1: return ast_GmlNode_Number(q[2], 0, null);
			}
			break;
		case 25/* BinOp */:
			switch (q[3]) {
				case 64: return ast_GmlNode_BinOp(q[2], 65, q[4], q[5]);
				case 65: return ast_GmlNode_BinOp(q[2], 64, q[4], q[5]);
				case 66: return ast_GmlNode_BinOp(q[2], 69, q[4], q[5]);
				case 67: return ast_GmlNode_BinOp(q[2], 68, q[4], q[5]);
				case 68: return ast_GmlNode_BinOp(q[2], 67, q[4], q[5]);
				case 69: return ast_GmlNode_BinOp(q[2], 66, q[4], q[5]);
			}
			break;
	}
	return ast_GmlNode_UnOp(q[2], ast_GmlNodeTools_clone(q), 1);
}
function ast_GmlNodeTools_isBoolean(q) {
	switch (q[1]/* ast.GmlNode */) {
		case 24/* UnOp */: return q[4] == 1 && true;
		case 25/* BinOp */: return ast__GmlOp_GmlOp_Impl__isBoolean(q[3]);
		case 28/* FromBool */: return true;
		default: return false;
	}
}
function ast_GmlNodeTools_isInt(q) {
	switch (q[1]/* ast.GmlNode */) {
		case 1/* Number */:
			var v = q[3];
			return v == (v | 0);
		case 20/* CallFunc */:
			switch (q[3]) {
				case "ceil": case "floor": case "round": return true;
				default: return false;
			}
		case 25/* BinOp */:
			switch (q[3]) {
				case 1: return false;
				case 3: return true;
				case 0: case 2: case 16: case 17: return ast_GmlNodeTools_isInt(q[4]) && ast_GmlNodeTools_isInt(q[5]);
				case 32: case 33: case 48: case 49: case 50: return true;
				case 64: case 65: case 66: case 67: case 68: case 69: case 80: case 96: return true;
				default: return false;
			}
		case 28/* FromBool */: return true;
		default: return false;
	}
}
function ast_GmlNodeTools_equalsList(a, b) {
	var n = a.length;
	if (b.length != n) return false;
	var i = 0;
	while (i < n) {
		if (ast_GmlNodeTools_equals(a[i], b[i])) {
			++i;
		} else return false;
	}
	return true;
}
function ast_GmlNodeTools_equals(a, b) {
	if (a[1] != b[1]) return false;
	var i, n;
	switch (a[1]/* ast.GmlNode */) {
		case 0/* Undefined */: return true;
		case 1/* Number */:
			if (b[1] == 1) {
				var b_src = b[4];
				return a[3] == b[3] && a[4] == b_src;
			} else return false;
		case 2/* CString */: return b[1] == 2 && a[3] == b[3];
		case 3/* EnumCtr */:
			if (b[1] == 3) {
				var b_ctr = b[4];
				return a[3] == b[3] && a[4] == b_ctr;
			} else return false;
		case 4/* ArrayDecl */: return b[1] == 4 && ast_GmlNodeTools_equalsList(a[3], b[3]);
		case 5/* ObjectDecl */:
			var m1 = a[4];
			if (b[1] == 5) {
				var m2 = b[4];
				var k2 = b[3];
				n = m1.length;
				if (m2.length == n) {
					i = 0;
					while (i < n) {
						if (a[3][i] == k2[i] && ast_GmlNodeTools_equals(m1[i], m2[i])) {
							++i;
						} else break;
					}
					return i >= n;
				} else return false;
			} else return false;
		case 6/* EnsureArray */: return b[1] == 6 && ast_GmlNodeTools_equals(a[3], b[3]);
		case 7/* Ident */: return b[1] == 7 && a[3] == b[3];
		case 8/* Self */: return true;
		case 9/* Other */: return true;
		case 10/* Script */: return b[1] == 10 && a[3] == b[3];
		case 11/* Const */: return b[1] == 11 && a[3] == b[3];
		case 12/* ArgConst */: return b[1] == 12 && a[3] == b[3];
		case 13/* ArgIndex */: return b[1] == 13 && ast_GmlNodeTools_equals(a[3], b[3]);
		case 14/* ArgCount */: return true;
		case 15/* Call */:
			if (b[1] == 15) {
				var b_args = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equalsList(a[4], b_args);
			} else return false;
		case 16/* CallScript */:
			if (b[1] == 16) {
				var b_args1 = b[4];
				return a[3] == b[3] && ast_GmlNodeTools_equalsList(a[4], b_args1);
			} else return false;
		case 17/* CallScriptAt */:
			if (b[1] == 17) {
				var b_args2 = b[5];
				var b_script = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_script && ast_GmlNodeTools_equalsList(a[5], b_args2);
			} else return false;
		case 18/* CallScriptId */:
			if (b[1] == 18) {
				var b_args3 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equalsList(a[4], b_args3);
			} else return false;
		case 19/* CallField */:
			if (b[1] == 19) {
				var b_args4 = b[5];
				var b_prop = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_prop && ast_GmlNodeTools_equalsList(a[5], b_args4);
			} else return false;
		case 20/* CallFunc */:
			if (b[1] == 20) {
				var b_args5 = b[4];
				return a[3] == b[3] && ast_GmlNodeTools_equalsList(a[4], b_args5);
			} else return false;
		case 21/* CallFuncAt */:
			if (b[1] == 21) {
				var b_args6 = b[5];
				var b_s1 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_s1 && ast_GmlNodeTools_equalsList(a[5], b_args6);
			} else return false;
		case 22/* Prefix */:
			if (b[1] == 22) {
				var b_inc = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_inc;
			} else return false;
		case 23/* Postfix */:
			if (b[1] == 23) {
				var b_inc1 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_inc1;
			} else return false;
		case 24/* UnOp */:
			if (b[1] == 24) {
				var b_o = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_o;
			} else return false;
		case 25/* BinOp */:
			if (b[1] == 25) {
				var b_b = b[5];
				var b_a = b[4];
				return a[3] == b[3] && ast_GmlNodeTools_equals(a[4], b_a) && ast_GmlNodeTools_equals(a[5], b_b);
			} else return false;
		case 26/* SetOp */:
			if (b[1] == 26) {
				var b_b1 = b[5];
				var b_a1 = b[4];
				return a[3] == b[3] && ast_GmlNodeTools_equals(a[4], b_a1) && ast_GmlNodeTools_equals(a[5], b_b1);
			} else return false;
		case 27/* ToBool */: return b[1] == 27 && ast_GmlNodeTools_equals(a[3], b[3]);
		case 28/* FromBool */: return b[1] == 28 && ast_GmlNodeTools_equals(a[3], b[3]);
		case 29/* In */:
			if (b[1] == 29) {
				var b_not = b[5];
				var b_val = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_val) && a[5] == b_not;
			} else return false;
		case 30/* Local */: return b[1] == 30 && a[3] == b[3];
		case 31/* LocalSet */:
			if (b[1] == 31) {
				var b_val1 = b[4];
				return a[3] == b[3] && ast_GmlNodeTools_equals(a[4], b_val1);
			} else return false;
		case 32/* LocalAop */:
			if (b[1] == 32) {
				var b_val2 = b[5];
				var b_op = b[4];
				return a[3] == b[3] && a[4] == b_op && ast_GmlNodeTools_equals(a[5], b_val2);
			} else return false;
		case 33/* Global */: return b[1] == 33 && a[3] == b[3];
		case 34/* GlobalSet */:
			if (b[1] == 34) {
				var b_val3 = b[4];
				return a[3] == b[3] && ast_GmlNodeTools_equals(a[4], b_val3);
			} else return false;
		case 35/* GlobalAop */:
			if (b[1] == 35) {
				var b_val4 = b[5];
				var b_op1 = b[4];
				return a[3] == b[3] && a[4] == b_op1 && ast_GmlNodeTools_equals(a[5], b_val4);
			} else return false;
		case 36/* Field */:
			if (b[1] == 36) {
				var b_fd1 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_fd1;
			} else return false;
		case 37/* FieldSet */:
			if (b[1] == 37) {
				var b_val5 = b[5];
				var b_fd2 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_fd2 && ast_GmlNodeTools_equals(a[5], b_val5);
			} else return false;
		case 38/* FieldAop */:
			if (b[1] == 38) {
				var b_val6 = b[6];
				var b_op2 = b[5];
				var b_fd3 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_fd3 && a[5] == b_op2 && ast_GmlNodeTools_equals(a[6], b_val6);
			} else return false;
		case 39/* Env */: return b[1] == 39 && a[3] == b[3];
		case 40/* EnvSet */:
			if (b[1] == 40) {
				var b_val7 = b[4];
				return a[3] == b[3] && ast_GmlNodeTools_equals(a[4], b_val7);
			} else return false;
		case 41/* EnvAop */:
			if (b[1] == 41) {
				var b_val8 = b[5];
				var b_op3 = b[4];
				return a[3] == b[3] && a[4] == b_op3 && ast_GmlNodeTools_equals(a[5], b_val8);
			} else return false;
		case 42/* EnvFd */:
			if (b[1] == 42) {
				var b_fd4 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_fd4;
			} else return false;
		case 43/* EnvFdSet */:
			if (b[1] == 43) {
				var b_v2 = b[5];
				var b_fd5 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_fd5 && ast_GmlNodeTools_equals(a[5], b_v2);
			} else return false;
		case 44/* EnvFdAop */:
			if (b[1] == 44) {
				var b_v3 = b[6];
				var b_op4 = b[5];
				var b_fd6 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_fd6 && a[5] == b_op4 && ast_GmlNodeTools_equals(a[6], b_v3);
			} else return false;
		case 45/* Env1d */:
			if (b[1] == 45) {
				var b_k = b[4];
				return a[3] == b[3] && ast_GmlNodeTools_equals(a[4], b_k);
			} else return false;
		case 46/* Env1dSet */:
			if (b[1] == 46) {
				var b_val9 = b[5];
				var b_k1 = b[4];
				return a[3] == b[3] && ast_GmlNodeTools_equals(a[4], b_k1) && ast_GmlNodeTools_equals(a[5], b_val9);
			} else return false;
		case 47/* Env1dAop */:
			if (b[1] == 47) {
				var b_val10 = b[6];
				var b_op5 = b[5];
				var b_k2 = b[4];
				return a[3] == b[3] && ast_GmlNodeTools_equals(a[4], b_k2) && a[5] == b_op5 && ast_GmlNodeTools_equals(a[6], b_val10);
			} else return false;
		case 48/* Index */:
			if (b[1] == 48) {
				var b_id16 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_id16);
			} else return false;
		case 49/* IndexSet */:
			if (b[1] == 49) {
				var b_v4 = b[5];
				var b_id17 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_id17) && ast_GmlNodeTools_equals(a[5], b_v4);
			} else return false;
		case 50/* IndexAop */:
			if (b[1] == 50) {
				var b_v5 = b[6];
				var b_o3 = b[5];
				var b_id18 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_id18) && a[5] == b_o3 && ast_GmlNodeTools_equals(a[6], b_v5);
			} else return false;
		case 51/* IndexPrefix */:
			if (b[1] == 51) {
				var b_inc2 = b[5];
				var b_i = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i) && a[5] == b_inc2;
			} else return false;
		case 52/* IndexPostfix */:
			if (b[1] == 52) {
				var b_inc3 = b[5];
				var b_i1 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i1) && a[5] == b_inc3;
			} else return false;
		case 53/* Index2d */:
			if (b[1] == 53) {
				var b_i2 = b[5];
				var b_i11 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i11) && ast_GmlNodeTools_equals(a[5], b_i2);
			} else return false;
		case 54/* Index2dSet */:
			if (b[1] == 54) {
				var b_v6 = b[6];
				var b_i21 = b[5];
				var b_i12 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i12) && ast_GmlNodeTools_equals(a[5], b_i21) && ast_GmlNodeTools_equals(a[6], b_v6);
			} else return false;
		case 55/* Index2dAop */:
			if (b[1] == 55) {
				var b_v7 = b[7];
				var b_o4 = b[6];
				var b_i22 = b[5];
				var b_i13 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i13) && ast_GmlNodeTools_equals(a[5], b_i22) && a[6] == b_o4 && ast_GmlNodeTools_equals(a[7], b_v7);
			} else return false;
		case 56/* Index2dPrefix */:
			if (b[1] == 56) {
				var b_inc4 = b[6];
				var b_k3 = b[5];
				var b_i3 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i3) && ast_GmlNodeTools_equals(a[5], b_k3) && a[6] == b_inc4;
			} else return false;
		case 57/* Index2dPostfix */:
			if (b[1] == 57) {
				var b_inc5 = b[6];
				var b_k4 = b[5];
				var b_i4 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i4) && ast_GmlNodeTools_equals(a[5], b_k4) && a[6] == b_inc5;
			} else return false;
		case 58/* RawId */:
			if (b[1] == 58) {
				var b_id19 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_id19);
			} else return false;
		case 59/* RawIdSet */:
			if (b[1] == 59) {
				var b_v8 = b[5];
				var b_id20 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_id20) && ast_GmlNodeTools_equals(a[5], b_v8);
			} else return false;
		case 60/* RawIdAop */:
			if (b[1] == 60) {
				var b_v9 = b[6];
				var b_o5 = b[5];
				var b_id21 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_id21) && a[5] == b_o5 && ast_GmlNodeTools_equals(a[6], b_v9);
			} else return false;
		case 61/* RawIdPrefix */:
			if (b[1] == 61) {
				var b_inc6 = b[5];
				var b_i5 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i5) && a[5] == b_inc6;
			} else return false;
		case 62/* RawIdPostfix */:
			if (b[1] == 62) {
				var b_inc7 = b[5];
				var b_i6 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i6) && a[5] == b_inc7;
			} else return false;
		case 63/* RawId2d */:
			if (b[1] == 63) {
				var b_i23 = b[5];
				var b_i14 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i14) && ast_GmlNodeTools_equals(a[5], b_i23);
			} else return false;
		case 64/* RawId2dSet */:
			if (b[1] == 64) {
				var b_v10 = b[6];
				var b_i24 = b[5];
				var b_i15 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i15) && ast_GmlNodeTools_equals(a[5], b_i24) && ast_GmlNodeTools_equals(a[6], b_v10);
			} else return false;
		case 65/* RawId2dAop */:
			if (b[1] == 65) {
				var b_v11 = b[7];
				var b_o6 = b[6];
				var b_i25 = b[5];
				var b_i16 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i16) && ast_GmlNodeTools_equals(a[5], b_i25) && a[6] == b_o6 && ast_GmlNodeTools_equals(a[7], b_v11);
			} else return false;
		case 66/* RawId2dPrefix */:
			if (b[1] == 66) {
				var b_inc8 = b[6];
				var b_k5 = b[5];
				var b_i7 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i7) && ast_GmlNodeTools_equals(a[5], b_k5) && a[6] == b_inc8;
			} else return false;
		case 67/* RawId2dPostfix */:
			if (b[1] == 67) {
				var b_inc9 = b[6];
				var b_k6 = b[5];
				var b_i8 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i8) && ast_GmlNodeTools_equals(a[5], b_k6) && a[6] == b_inc9;
			} else return false;
		case 68/* DsList */:
			if (b[1] == 68) {
				var b_id22 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_id22);
			} else return false;
		case 69/* DsListSet */:
			if (b[1] == 69) {
				var b_v12 = b[5];
				var b_id23 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_id23) && ast_GmlNodeTools_equals(a[5], b_v12);
			} else return false;
		case 70/* DsListAop */:
			if (b[1] == 70) {
				var b_v13 = b[6];
				var b_o7 = b[5];
				var b_id24 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_id24) && a[5] == b_o7 && ast_GmlNodeTools_equals(a[6], b_v13);
			} else return false;
		case 71/* DsListPrefix */:
			if (b[1] == 71) {
				var b_inc10 = b[5];
				var b_i9 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i9) && a[5] == b_inc10;
			} else return false;
		case 72/* DsListPostfix */:
			if (b[1] == 72) {
				var b_inc11 = b[5];
				var b_i10 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i10) && a[5] == b_inc11;
			} else return false;
		case 73/* DsMap */:
			if (b[1] == 73) {
				var b_id25 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_id25);
			} else return false;
		case 74/* DsMapSet */:
			if (b[1] == 74) {
				var b_v14 = b[5];
				var b_id26 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_id26) && ast_GmlNodeTools_equals(a[5], b_v14);
			} else return false;
		case 75/* DsMapAop */:
			if (b[1] == 75) {
				var b_v15 = b[6];
				var b_o8 = b[5];
				var b_id27 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_id27) && a[5] == b_o8 && ast_GmlNodeTools_equals(a[6], b_v15);
			} else return false;
		case 76/* DsMapPrefix */:
			if (b[1] == 76) {
				var b_inc12 = b[5];
				var b_i17 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i17) && a[5] == b_inc12;
			} else return false;
		case 77/* DsMapPostfix */:
			if (b[1] == 77) {
				var b_inc13 = b[5];
				var b_i18 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i18) && a[5] == b_inc13;
			} else return false;
		case 78/* DsGrid */:
			if (b[1] == 78) {
				var b_i26 = b[5];
				var b_i19 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i19) && ast_GmlNodeTools_equals(a[5], b_i26);
			} else return false;
		case 79/* DsGridSet */:
			if (b[1] == 79) {
				var b_v16 = b[6];
				var b_i27 = b[5];
				var b_i110 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i110) && ast_GmlNodeTools_equals(a[5], b_i27) && ast_GmlNodeTools_equals(a[6], b_v16);
			} else return false;
		case 80/* DsGridAop */:
			if (b[1] == 80) {
				var b_v17 = b[7];
				var b_o9 = b[6];
				var b_i28 = b[5];
				var b_i111 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i111) && ast_GmlNodeTools_equals(a[5], b_i28) && a[6] == b_o9 && ast_GmlNodeTools_equals(a[7], b_v17);
			} else return false;
		case 81/* DsGridPrefix */:
			if (b[1] == 81) {
				var b_inc14 = b[6];
				var b_k7 = b[5];
				var b_i20 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i20) && ast_GmlNodeTools_equals(a[5], b_k7) && a[6] == b_inc14;
			} else return false;
		case 82/* DsGridPostfix */:
			if (b[1] == 82) {
				var b_inc15 = b[6];
				var b_k8 = b[5];
				var b_i29 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_i29) && ast_GmlNodeTools_equals(a[5], b_k8) && a[6] == b_inc15;
			} else return false;
		case 83/* VarDecl */:
			var a_value2 = a[4];
			if (b[1] == 83) {
				var b_value2 = b[4];
				if (a[3] == b[3]) {
					if (a_value2 != null) {
						return b_value2 != null && ast_GmlNodeTools_equals(a_value2, b_value2);
					} else return b_value2 == null;
				} else return false;
			} else return false;
		case 84/* Block */: return b[1] == 84 && ast_GmlNodeTools_equalsList(a[3], b[3]);
		case 85/* IfThen */:
			var a_not1 = a[5];
			if (b[1] == 85) {
				var b_not1 = b[5];
				var b_then = b[4];
				if (ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_then)) {
					if (a_not1 != null) {
						return b_not1 != null && ast_GmlNodeTools_equals(a_not1, b_not1);
					} else return b_not1 == null;
				} else return false;
			} else return false;
		case 86/* Ternary */:
			if (b[1] == 86) {
				var b_not2 = b[5];
				var b_then1 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_then1) && ast_GmlNodeTools_equals(a[5], b_not2);
			} else return false;
		case 87/* Switch */:
			var o1 = a[5];
			var m11 = a[4];
			if (b[1] == 87) {
				var o2 = b[5];
				var m21 = b[4];
				if (ast_GmlNodeTools_equals(a[3], b[3]) && (o1 != null && o2 != null && ast_GmlNodeTools_equals(o1, o2) || o1 == null && o2 == null)) {
					n = m11.length;
					if (m21.length != n) return false;
					i = 0;
					while (i < n) {
						if (ast_GmlNodeTools_equals(m11[i].expr, m21[i].expr) && ast_GmlNodeTools_equalsList(m11[i].values, m21[i].values)) {
							++i;
						} else break;
					}
					return i >= n;
				} else return false;
			} else return false;
		case 88/* Wait */: return b[1] == 88 && ast_GmlNodeTools_equals(a[3], b[3]);
		case 89/* Fork */: return true;
		case 90/* While */:
			if (b[1] == 90) {
				var b_node = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_node);
			} else return false;
		case 91/* DoUntil */:
			if (b[1] == 91) {
				var b_cond3 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_cond3);
			} else return false;
		case 92/* DoWhile */:
			if (b[1] == 92) {
				var b_cond4 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_cond4);
			} else return false;
		case 93/* Repeat */:
			if (b[1] == 93) {
				var b_node3 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_node3);
			} else return false;
		case 94/* For */:
			if (b[1] == 94) {
				var b_loop = b[6];
				var b_post = b[5];
				var b_cond5 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_cond5) && ast_GmlNodeTools_equals(a[5], b_post) && ast_GmlNodeTools_equals(a[6], b_loop);
			} else return false;
		case 95/* With */:
			if (b[1] == 95) {
				var b_node4 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && ast_GmlNodeTools_equals(a[4], b_node4);
			} else return false;
		case 96/* Once */: return b[1] == 96 && ast_GmlNodeTools_equals(a[3], b[3]);
		case 97/* Return */: return b[1] == 97 && ast_GmlNodeTools_equals(a[3], b[3]);
		case 98/* Exit */: return true;
		case 99/* Break */: return true;
		case 100/* Continue */: return true;
		case 101/* Debugger */: return true;
		case 102/* TryCatch */:
			if (b[1] == 102) {
				var b_cat = b[5];
				var b_cap = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_cap && ast_GmlNodeTools_equals(a[5], b_cat);
			} else return false;
		case 103/* Throw */: return b[1] == 103 && ast_GmlNodeTools_equals(a[3], b[3]);
		case 104/* CommentLine */: return b[1] == 104 && a[3] == b[3];
		case 105/* CommentLinePre */:
			if (b[1] == 105) {
				var b_x38 = b[4];
				return a[3] == b[3] && ast_GmlNodeTools_equals(a[4], b_x38);
			} else return false;
		case 106/* CommentLinePost */:
			if (b[1] == 106) {
				var b_s4 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_s4;
			} else return false;
		case 107/* CommentLineSep */:
			if (b[1] == 107) {
				var b_x40 = b[4];
				return a[3] == b[3] && ast_GmlNodeTools_equals(a[4], b_x40);
			} else return false;
		case 108/* CommentBlock */: return b[1] == 108 && a[3] == b[3];
		case 109/* CommentBlockPre */:
			if (b[1] == 109) {
				var b_pl = b[5];
				var b_x41 = b[4];
				return a[3] == b[3] && ast_GmlNodeTools_equals(a[4], b_x41) && a[5] == b_pl;
			} else return false;
		case 110/* CommentBlockPost */:
			if (b[1] == 110) {
				var b_pl1 = b[5];
				var b_s8 = b[4];
				return ast_GmlNodeTools_equals(a[3], b[3]) && a[4] == b_s8 && a[5] == b_pl1;
			} else return false;
	}
}
function ast_GmlNodeTools_cloneOpt(q) {
	if (q != null) {
		return ast_GmlNodeTools_clone(q);
	} else return null;
}
function ast_GmlNodeTools_clone(q) {
	var xw, i, n;
	var d = q[2];
	switch (q[1]/* ast.GmlNode */) {
		case 0/* Undefined */: return ast_GmlNode_Undefined(d);
		case 1/* Number */: return ast_GmlNode_Number(d, q[3], q[4]);
		case 2/* CString */: return ast_GmlNode_CString(d, q[3]);
		case 3/* EnumCtr */: return ast_GmlNode_EnumCtr(d, q[3], q[4]);
		case 4/* ArrayDecl */:
			xw = q[3].slice();
			i = xw.length;
			while (--i >= 0) {
				xw[i] = ast_GmlNodeTools_clone(xw[i]);
			}
			return ast_GmlNode_ArrayDecl(d, xw);
		case 5/* ObjectDecl */:
			xw = q[4].slice();
			i = xw.length;
			while (--i >= 0) {
				xw[i] = ast_GmlNodeTools_clone(xw[i]);
			}
			return ast_GmlNode_ObjectDecl(d, q[3].slice(0), xw);
		case 6/* EnsureArray */: return ast_GmlNode_EnsureArray(d, ast_GmlNodeTools_clone(q[3]));
		case 7/* Ident */: return ast_GmlNode_Ident(d, q[3]);
		case 8/* Self */: return ast_GmlNode_Self(d);
		case 9/* Other */: return ast_GmlNode_Other(d);
		case 10/* Script */: return ast_GmlNode_Script(d, q[3]);
		case 11/* Const */: return ast_GmlNode_Const(d, q[3]);
		case 12/* ArgConst */: return ast_GmlNode_ArgConst(d, q[3]);
		case 13/* ArgIndex */: return ast_GmlNode_ArgIndex(d, ast_GmlNodeTools_clone(q[3]));
		case 14/* ArgCount */: return ast_GmlNode_ArgCount(d);
		case 15/* Call */:
			xw = q[4].slice();
			i = xw.length;
			while (--i >= 0) {
				xw[i] = ast_GmlNodeTools_clone(xw[i]);
			}
			return ast_GmlNode_Call(d, ast_GmlNodeTools_clone(q[3]), xw);
		case 16/* CallScript */:
			xw = q[4].slice();
			i = xw.length;
			while (--i >= 0) {
				xw[i] = ast_GmlNodeTools_clone(xw[i]);
			}
			return ast_GmlNode_CallScript(d, q[3], xw);
		case 17/* CallScriptAt */:
			xw = q[5].slice();
			i = xw.length;
			while (--i >= 0) {
				xw[i] = ast_GmlNodeTools_clone(xw[i]);
			}
			return ast_GmlNode_CallScriptAt(d, ast_GmlNodeTools_clone(q[3]), q[4], xw);
		case 18/* CallScriptId */:
			xw = q[4].slice();
			i = xw.length;
			while (--i >= 0) {
				xw[i] = ast_GmlNodeTools_clone(xw[i]);
			}
			return ast_GmlNode_CallScriptId(d, ast_GmlNodeTools_clone(q[3]), xw);
		case 19/* CallField */:
			xw = q[5].slice();
			i = xw.length;
			while (--i >= 0) {
				xw[i] = ast_GmlNodeTools_clone(xw[i]);
			}
			return ast_GmlNode_CallField(d, ast_GmlNodeTools_clone(q[3]), q[4], xw);
		case 20/* CallFunc */:
			xw = q[4].slice();
			i = xw.length;
			while (--i >= 0) {
				xw[i] = ast_GmlNodeTools_clone(xw[i]);
			}
			return ast_GmlNode_CallFunc(d, q[3], xw);
		case 21/* CallFuncAt */:
			xw = q[5].slice();
			i = xw.length;
			while (--i >= 0) {
				xw[i] = ast_GmlNodeTools_clone(xw[i]);
			}
			return ast_GmlNode_CallFuncAt(d, ast_GmlNodeTools_clone(q[3]), q[4], xw);
		case 22/* Prefix */: return ast_GmlNode_Prefix(d, ast_GmlNodeTools_clone(q[3]), q[4]);
		case 23/* Postfix */: return ast_GmlNode_Postfix(d, ast_GmlNodeTools_clone(q[3]), q[4]);
		case 24/* UnOp */: return ast_GmlNode_UnOp(d, ast_GmlNodeTools_clone(q[3]), q[4]);
		case 25/* BinOp */: return ast_GmlNode_BinOp(d, q[3], ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]));
		case 26/* SetOp */: return ast_GmlNode_SetOp(d, q[3], ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]));
		case 27/* ToBool */: return ast_GmlNode_ToBool(d, ast_GmlNodeTools_clone(q[3]));
		case 28/* FromBool */: return ast_GmlNode_FromBool(d, ast_GmlNodeTools_clone(q[3]));
		case 29/* In */: return ast_GmlNode_In(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), q[5]);
		case 30/* Local */: return ast_GmlNode_Local(d, q[3]);
		case 31/* LocalSet */: return ast_GmlNode_LocalSet(d, q[3], ast_GmlNodeTools_clone(q[4]));
		case 32/* LocalAop */: return ast_GmlNode_LocalAop(d, q[3], q[4], ast_GmlNodeTools_clone(q[5]));
		case 33/* Global */: return ast_GmlNode_Global(d, q[3]);
		case 34/* GlobalSet */: return ast_GmlNode_GlobalSet(d, q[3], ast_GmlNodeTools_clone(q[4]));
		case 35/* GlobalAop */: return ast_GmlNode_GlobalAop(d, q[3], q[4], ast_GmlNodeTools_clone(q[5]));
		case 36/* Field */: return ast_GmlNode_Field(d, ast_GmlNodeTools_clone(q[3]), q[4]);
		case 37/* FieldSet */: return ast_GmlNode_FieldSet(d, ast_GmlNodeTools_clone(q[3]), q[4], ast_GmlNodeTools_clone(q[5]));
		case 38/* FieldAop */: return ast_GmlNode_FieldAop(d, ast_GmlNodeTools_clone(q[3]), q[4], q[5], ast_GmlNodeTools_clone(q[6]));
		case 39/* Env */: return ast_GmlNode_Env(d, q[3]);
		case 40/* EnvSet */: return ast_GmlNode_EnvSet(d, q[3], ast_GmlNodeTools_clone(q[4]));
		case 41/* EnvAop */: return ast_GmlNode_EnvAop(d, q[3], q[4], ast_GmlNodeTools_clone(q[5]));
		case 42/* EnvFd */: return ast_GmlNode_EnvFd(d, ast_GmlNodeTools_clone(q[3]), q[4]);
		case 43/* EnvFdSet */: return ast_GmlNode_EnvFdSet(d, ast_GmlNodeTools_clone(q[3]), q[4], ast_GmlNodeTools_clone(q[5]));
		case 44/* EnvFdAop */: return ast_GmlNode_EnvFdAop(d, ast_GmlNodeTools_clone(q[3]), q[4], q[5], ast_GmlNodeTools_clone(q[6]));
		case 45/* Env1d */: return ast_GmlNode_Env1d(d, q[3], ast_GmlNodeTools_clone(q[4]));
		case 46/* Env1dSet */: return ast_GmlNode_Env1dSet(d, q[3], ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]));
		case 47/* Env1dAop */: return ast_GmlNode_Env1dAop(d, q[3], ast_GmlNodeTools_clone(q[4]), q[5], ast_GmlNodeTools_clone(q[6]));
		case 48/* Index */: return ast_GmlNode_Index(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]));
		case 49/* IndexSet */: return ast_GmlNode_IndexSet(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]));
		case 50/* IndexAop */: return ast_GmlNode_IndexAop(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), q[5], ast_GmlNodeTools_clone(q[6]));
		case 51/* IndexPrefix */: return ast_GmlNode_IndexPrefix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), q[5]);
		case 52/* IndexPostfix */: return ast_GmlNode_IndexPostfix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), q[5]);
		case 53/* Index2d */: return ast_GmlNode_Index2d(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]));
		case 54/* Index2dSet */: return ast_GmlNode_Index2dSet(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]), ast_GmlNodeTools_clone(q[6]));
		case 55/* Index2dAop */: return ast_GmlNode_Index2dAop(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]), q[6], ast_GmlNodeTools_clone(q[7]));
		case 56/* Index2dPrefix */: return ast_GmlNode_Index2dPrefix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]), q[6]);
		case 57/* Index2dPostfix */: return ast_GmlNode_Index2dPostfix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]), q[6]);
		case 58/* RawId */: return ast_GmlNode_RawId(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]));
		case 59/* RawIdSet */: return ast_GmlNode_RawIdSet(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]));
		case 60/* RawIdAop */: return ast_GmlNode_RawIdAop(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), q[5], ast_GmlNodeTools_clone(q[6]));
		case 61/* RawIdPrefix */: return ast_GmlNode_RawIdPrefix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), q[5]);
		case 62/* RawIdPostfix */: return ast_GmlNode_RawIdPostfix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), q[5]);
		case 63/* RawId2d */: return ast_GmlNode_RawId2d(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]));
		case 64/* RawId2dSet */: return ast_GmlNode_RawId2dSet(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]), ast_GmlNodeTools_clone(q[6]));
		case 65/* RawId2dAop */: return ast_GmlNode_RawId2dAop(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]), q[6], ast_GmlNodeTools_clone(q[7]));
		case 66/* RawId2dPrefix */: return ast_GmlNode_RawId2dPrefix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]), q[6]);
		case 67/* RawId2dPostfix */: return ast_GmlNode_RawId2dPostfix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]), q[6]);
		case 68/* DsList */: return ast_GmlNode_DsList(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]));
		case 69/* DsListSet */: return ast_GmlNode_DsListSet(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]));
		case 70/* DsListAop */: return ast_GmlNode_DsListAop(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), q[5], ast_GmlNodeTools_clone(q[6]));
		case 71/* DsListPrefix */: return ast_GmlNode_DsListPrefix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), q[5]);
		case 72/* DsListPostfix */: return ast_GmlNode_DsListPostfix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), q[5]);
		case 73/* DsMap */: return ast_GmlNode_DsMap(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]));
		case 74/* DsMapSet */: return ast_GmlNode_DsMapSet(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]));
		case 75/* DsMapAop */: return ast_GmlNode_DsMapAop(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), q[5], ast_GmlNodeTools_clone(q[6]));
		case 76/* DsMapPrefix */: return ast_GmlNode_DsMapPrefix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), q[5]);
		case 77/* DsMapPostfix */: return ast_GmlNode_DsMapPostfix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), q[5]);
		case 78/* DsGrid */: return ast_GmlNode_DsGrid(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]));
		case 79/* DsGridSet */: return ast_GmlNode_DsGridSet(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]), ast_GmlNodeTools_clone(q[6]));
		case 80/* DsGridAop */: return ast_GmlNode_DsGridAop(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]), q[6], ast_GmlNodeTools_clone(q[7]));
		case 81/* DsGridPrefix */: return ast_GmlNode_DsGridPrefix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]), q[6]);
		case 82/* DsGridPostfix */: return ast_GmlNode_DsGridPostfix(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]), q[6]);
		case 83/* VarDecl */: return ast_GmlNode_VarDecl(d, q[3], ast_GmlNodeTools_cloneOpt(q[4]));
		case 84/* Block */:
			xw = q[3].slice();
			i = xw.length;
			while (--i >= 0) {
				xw[i] = ast_GmlNodeTools_clone(xw[i]);
			}
			return ast_GmlNode_Block(d, xw);
		case 85/* IfThen */: return ast_GmlNode_IfThen(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_cloneOpt(q[5]));
		case 86/* Ternary */: return ast_GmlNode_Ternary(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]));
		case 87/* Switch */:
			var m = q[4];
			m = m.slice();
			n = m.length;
			for (i = 0; i < n; ++i) {
				xw = m[i].values.slice();
				i = xw.length;
				while (--i >= 0) {
					xw[i] = ast_GmlNodeTools_clone(xw[i]);
				}
				m[i] = {
					values: xw, 
					expr: ast_GmlNodeTools_clone(m[i].expr), 
					pre: m[i].pre
				};
				xw = m[i].pre.slice();
				i = xw.length;
				while (--i >= 0) {
					xw[i] = ast_GmlNodeTools_clone(xw[i]);
				}
				m[i].pre = xw;
			}
			return ast_GmlNode_Switch(q[2], ast_GmlNodeTools_clone(q[3]), m, ast_GmlNodeTools_cloneOpt(q[5]));
		case 88/* Wait */: return ast_GmlNode_Wait(d, ast_GmlNodeTools_clone(q[3]));
		case 89/* Fork */: return ast_GmlNode_Fork(d);
		case 90/* While */: return ast_GmlNode_While(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]));
		case 91/* DoUntil */: return ast_GmlNode_DoUntil(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]));
		case 92/* DoWhile */: return ast_GmlNode_DoWhile(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]));
		case 93/* Repeat */: return ast_GmlNode_Repeat(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]));
		case 94/* For */: return ast_GmlNode_For(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]), ast_GmlNodeTools_clone(q[5]), ast_GmlNodeTools_clone(q[6]));
		case 95/* With */: return ast_GmlNode_With(d, ast_GmlNodeTools_clone(q[3]), ast_GmlNodeTools_clone(q[4]));
		case 96/* Once */: return ast_GmlNode_Once(d, ast_GmlNodeTools_clone(q[3]));
		case 97/* Return */: return ast_GmlNode_Return(d, ast_GmlNodeTools_clone(q[3]));
		case 98/* Exit */: return ast_GmlNode_Exit(d);
		case 99/* Break */: return ast_GmlNode_Break(d);
		case 100/* Continue */: return ast_GmlNode_Continue(d);
		case 101/* Debugger */: return ast_GmlNode_Debugger(d);
		case 102/* TryCatch */: return ast_GmlNode_TryCatch(d, ast_GmlNodeTools_clone(q[3]), q[4], ast_GmlNodeTools_clone(q[5]));
		case 103/* Throw */: return ast_GmlNode_Throw(d, ast_GmlNodeTools_clone(q[3]));
		case 104/* CommentLine */: return ast_GmlNode_CommentLine(d, q[3]);
		case 105/* CommentLinePre */: return ast_GmlNode_CommentLinePre(d, q[3], ast_GmlNodeTools_clone(q[4]));
		case 106/* CommentLinePost */: return ast_GmlNode_CommentLinePost(d, ast_GmlNodeTools_clone(q[3]), q[4]);
		case 107/* CommentLineSep */: return ast_GmlNode_CommentLineSep(d, q[3], ast_GmlNodeTools_clone(q[4]));
		case 108/* CommentBlock */: return ast_GmlNode_CommentBlock(d, q[3]);
		case 109/* CommentBlockPre */: return ast_GmlNode_CommentBlockPre(d, q[3], ast_GmlNodeTools_clone(q[4]), q[5]);
		case 110/* CommentBlockPost */: return ast_GmlNode_CommentBlockPost(d, ast_GmlNodeTools_clone(q[3]), q[4], q[5]);
	}
}
function ast_GmlNodeTools_seekAllOut(q, st, c, si) {
	var x, w, i, n;
	var par = st[si];
	if (par == null) return false;
	switch (par[1]/* ast.GmlNode */) {
		case 84/* Block */:
			w = par[3];
			i = w.length;
			while (--i >= 0) {
				if (w[i] == q) break;
			}
			while (--i >= 0) {
				if (c(w[i], null)) return true;
			}
			break;
		case 85/* IfThen */:
			var c1 = par[3];
			if (c1 != q && c(c1, null)) return true;
			break;
		case 87/* Switch */:
			var c2 = par[3];
			if (c2 != q && c(c2, null)) return true;
			break;
		case 90/* While */:
			var c3 = par[3];
			if (c3 != q && c(c3, null)) return true;
			break;
		case 91/* DoUntil */:
			var c4 = par[3];
			if (c4 != q && c(c4, null)) return true;
			break;
		case 92/* DoWhile */:
			var c5 = par[3];
			if (c5 != q && c(c5, null)) return true;
			break;
		case 93/* Repeat */:
			var c6 = par[3];
			if (c6 != q && c(c6, null)) return true;
			break;
		case 94/* For */:
			var c7 = par[3];
			if (c7 != q && c(c7, null)) return true;
			break;
		case 95/* With */:
			var c8 = par[3];
			if (c8 != q && c(c8, null)) return true;
			break;
		case 105/* CommentLinePre */: break;
		case 106/* CommentLinePost */: break;
		case 107/* CommentLineSep */: break;
		case 109/* CommentBlockPre */: break;
		case 110/* CommentBlockPost */: break;
		default: throw new js__Boot_HaxeError("Can't seekAllOut over " + par[2].toString() + " " + par[0]);
	}
	return ast_GmlNodeTools_seekAllOut(par, st, c, si + 1);
}
function ast_GmlNodeTools_seekAll(q, st, c) {
	if (st != null) st.unshift(q);
	var r, x, w, i, n;
	switch (q[1]/* ast.GmlNode */) {
		case 0/* Undefined */: r = false; break;
		case 1/* Number */: r = false; break;
		case 2/* CString */: r = false; break;
		case 3/* EnumCtr */: r = false; break;
		case 4/* ArrayDecl */:
			w = q[3];
			n = w.length;
			for (i = 0; i < n; ++i) if (c(w[i], null)) break;
			r = i < n;
			break;
		case 5/* ObjectDecl */:
			w = q[4];
			n = w.length;
			for (i = 0; i < n; ++i) if (c(w[i], null)) break;
			r = i < n;
			break;
		case 6/* EnsureArray */: r = c(q[3], null); break;
		case 7/* Ident */: r = false; break;
		case 8/* Self */: r = false; break;
		case 9/* Other */: r = false; break;
		case 10/* Script */: r = false; break;
		case 11/* Const */: r = false; break;
		case 12/* ArgConst */: r = false; break;
		case 13/* ArgIndex */: r = c(q[3], null); break;
		case 14/* ArgCount */: r = false; break;
		case 15/* Call */:
			if (c(q[3], null)) {
				r = true;
			} else {
				w = q[4];
				n = w.length;
				for (i = 0; i < n; ++i) if (c(w[i], null)) break;
				r = i < n;
			}
			break;
		case 16/* CallScript */:
			w = q[4];
			n = w.length;
			for (i = 0; i < n; ++i) if (c(w[i], null)) break;
			r = i < n;
			break;
		case 17/* CallScriptAt */:
			if (c(q[3], null)) {
				r = true;
			} else {
				w = q[5];
				n = w.length;
				for (i = 0; i < n; ++i) if (c(w[i], null)) break;
				r = i < n;
			}
			break;
		case 18/* CallScriptId */:
			if (c(q[3], null)) {
				r = true;
			} else {
				w = q[4];
				n = w.length;
				for (i = 0; i < n; ++i) if (c(w[i], null)) break;
				r = i < n;
			}
			break;
		case 19/* CallField */:
			if (c(q[3], null)) {
				r = true;
			} else {
				w = q[5];
				n = w.length;
				for (i = 0; i < n; ++i) if (c(w[i], null)) break;
				r = i < n;
			}
			break;
		case 20/* CallFunc */:
			w = q[4];
			n = w.length;
			for (i = 0; i < n; ++i) if (c(w[i], null)) break;
			r = i < n;
			break;
		case 21/* CallFuncAt */:
			if (c(q[3], null)) {
				r = true;
			} else {
				w = q[5];
				n = w.length;
				for (i = 0; i < n; ++i) if (c(w[i], null)) break;
				r = i < n;
			}
			break;
		case 22/* Prefix */: r = c(q[3], null); break;
		case 23/* Postfix */: r = c(q[3], null); break;
		case 24/* UnOp */: r = c(q[3], null); break;
		case 25/* BinOp */:
			switch (q[3]) {
				case 80:
					var b = q[5];
					r = c(q[4], null) && c(b, null);
					break;
				case 96:
					var b1 = q[5];
					r = c(q[4], null);
					break;
				default:
					var l_b = q[5];
					var l_a = q[4];
					var l_o = q[3];
					r = c(l_a, null) || c(l_b, null);
			}
			break;
		case 26/* SetOp */: r = c(q[4], null) || c(q[5], null); break;
		case 27/* ToBool */: r = c(q[3], null); break;
		case 28/* FromBool */: r = c(q[3], null); break;
		case 29/* In */: r = c(q[3], null) || c(q[4], null); break;
		case 30/* Local */: r = false; break;
		case 31/* LocalSet */: r = c(q[4], null); break;
		case 32/* LocalAop */: r = c(q[5], null); break;
		case 33/* Global */: r = false; break;
		case 34/* GlobalSet */: r = c(q[4], null); break;
		case 35/* GlobalAop */: r = c(q[5], null); break;
		case 36/* Field */: r = c(q[3], null); break;
		case 37/* FieldSet */: r = c(q[3], null) || c(q[5], null); break;
		case 38/* FieldAop */: r = c(q[3], null) || c(q[6], null); break;
		case 39/* Env */: r = false; break;
		case 40/* EnvSet */: r = c(q[4], null); break;
		case 41/* EnvAop */: r = c(q[5], null); break;
		case 42/* EnvFd */: r = c(q[3], null); break;
		case 43/* EnvFdSet */: r = c(q[3], null) || c(q[5], null); break;
		case 44/* EnvFdAop */: r = c(q[3], null) || c(q[6], null); break;
		case 45/* Env1d */: r = c(q[4], null); break;
		case 46/* Env1dSet */: r = c(q[4], null) || c(q[5], null); break;
		case 47/* Env1dAop */: r = c(q[4], null) || c(q[6], null); break;
		case 48/* Index */: r = c(q[3], null) || c(q[4], null); break;
		case 49/* IndexSet */: r = c(q[3], null) || c(q[4], null) || c(q[5], null); break;
		case 50/* IndexAop */: r = c(q[3], null) || c(q[4], null) || c(q[6], null); break;
		case 51/* IndexPrefix */: r = c(q[3], null) || c(q[4], null); break;
		case 52/* IndexPostfix */: r = c(q[3], null) || c(q[4], null); break;
		case 53/* Index2d */: r = c(q[3], null) || c(q[4], null) || c(q[5], null); break;
		case 54/* Index2dSet */: r = c(q[3], null) || c(q[4], null) || c(q[5], null) || c(q[6], null); break;
		case 55/* Index2dAop */: r = c(q[3], null) || c(q[4], null) || c(q[5], null) || c(q[7], null); break;
		case 56/* Index2dPrefix */: r = c(q[3], null) || c(q[4], null) || c(q[5], null); break;
		case 57/* Index2dPostfix */: r = c(q[3], null) || c(q[4], null) || c(q[5], null); break;
		case 58/* RawId */: r = c(q[3], null) || c(q[4], null); break;
		case 59/* RawIdSet */: r = c(q[3], null) || c(q[4], null) || c(q[5], null); break;
		case 60/* RawIdAop */: r = c(q[3], null) || c(q[4], null) || c(q[6], null); break;
		case 61/* RawIdPrefix */: r = c(q[3], null) || c(q[4], null); break;
		case 62/* RawIdPostfix */: r = c(q[3], null) || c(q[4], null); break;
		case 63/* RawId2d */: r = c(q[3], null) || c(q[4], null) || c(q[5], null); break;
		case 64/* RawId2dSet */: r = c(q[3], null) || c(q[4], null) || c(q[5], null) || c(q[6], null); break;
		case 65/* RawId2dAop */: r = c(q[3], null) || c(q[4], null) || c(q[5], null) || c(q[7], null); break;
		case 66/* RawId2dPrefix */: r = c(q[3], null) || c(q[4], null) || c(q[5], null); break;
		case 67/* RawId2dPostfix */: r = c(q[3], null) || c(q[4], null) || c(q[5], null); break;
		case 68/* DsList */: r = c(q[3], null) || c(q[4], null); break;
		case 69/* DsListSet */: r = c(q[3], null) || c(q[4], null) || c(q[5], null); break;
		case 70/* DsListAop */: r = c(q[3], null) || c(q[4], null) || c(q[6], null); break;
		case 71/* DsListPrefix */: r = c(q[3], null) || c(q[4], null); break;
		case 72/* DsListPostfix */: r = c(q[3], null) || c(q[4], null); break;
		case 73/* DsMap */: r = c(q[3], null) || c(q[4], null); break;
		case 74/* DsMapSet */: r = c(q[3], null) || c(q[4], null) || c(q[5], null); break;
		case 75/* DsMapAop */: r = c(q[3], null) || c(q[4], null) || c(q[6], null); break;
		case 76/* DsMapPrefix */: r = c(q[3], null) || c(q[4], null); break;
		case 77/* DsMapPostfix */: r = c(q[3], null) || c(q[4], null); break;
		case 78/* DsGrid */: r = c(q[3], null) || c(q[4], null) || c(q[5], null); break;
		case 79/* DsGridSet */: r = c(q[3], null) || c(q[4], null) || c(q[5], null) || c(q[6], null); break;
		case 80/* DsGridAop */: r = c(q[3], null) || c(q[4], null) || c(q[5], null) || c(q[7], null); break;
		case 81/* DsGridPrefix */: r = c(q[3], null) || c(q[4], null) || c(q[5], null); break;
		case 82/* DsGridPostfix */: r = c(q[3], null) || c(q[4], null) || c(q[5], null); break;
		case 83/* VarDecl */:
			var v = q[4];
			r = v != null && c(v, null);
			break;
		case 84/* Block */:
			w = q[3];
			n = w.length;
			for (i = 0; i < n; ++i) if (c(w[i], null)) break;
			r = i < n;
			break;
		case 85/* IfThen */:
			var b2 = q[5];
			r = c(q[3], null) || b2 != null && c(q[4], null) && c(b2, null);
			break;
		case 86/* Ternary */: r = c(q[3], null) || c(q[4], null) && c(q[5], null); break;
		case 87/* Switch */:
			if (c(q[3], null)) {
				r = true;
			} else {
				x = q[5];
				if (x != null && c(x, null)) {
					n = q[4].length;
					i = 0;
					while (i < n) {
						if (c(x, null)) {
							++i;
						} else break;
					}
					r = i >= n;
				} else r = false;
			}
			break;
		case 88/* Wait */: r = c(q[3], null); break;
		case 89/* Fork */: r = false; break;
		case 90/* While */: r = c(q[3], null); break;
		case 91/* DoUntil */: r = c(q[3], null); break;
		case 92/* DoWhile */: r = c(q[3], null); break;
		case 93/* Repeat */: r = c(q[3], null); break;
		case 94/* For */: r = c(q[3], null) || c(q[4], null); break;
		case 95/* With */: r = c(q[3], null); break;
		case 96/* Once */: r = c(q[3], null); break;
		case 97/* Return */: r = c(q[3], null); break;
		case 98/* Exit */: r = false; break;
		case 99/* Break */: r = false; break;
		case 100/* Continue */: r = false; break;
		case 101/* Debugger */: r = false; break;
		case 102/* TryCatch */: r = c(q[3], null) || c(q[5], null); break;
		case 103/* Throw */: r = c(q[3], null); break;
		case 104/* CommentLine */: r = false; break;
		case 105/* CommentLinePre */: r = c(q[4], null); break;
		case 106/* CommentLinePost */: r = c(q[3], null); break;
		case 107/* CommentLineSep */: r = c(q[4], null); break;
		case 108/* CommentBlock */: r = false; break;
		case 109/* CommentBlockPre */: r = c(q[4], null); break;
		case 110/* CommentBlockPost */: r = c(q[3], null); break;
	}
	if (st != null) st.shift();
	return false;
}
function ast_GmlNodeTools_seek(q, st, c) {
	if (st != null) st.unshift(q);
	var r, x, w, i, n, k, l;
	switch (q[1]/* ast.GmlNode */) {
		case 0/* Undefined */: r = false; break;
		case 1/* Number */: r = false; break;
		case 2/* CString */: r = false; break;
		case 3/* EnumCtr */: r = false; break;
		case 4/* ArrayDecl */:
			w = q[3];
			n = w.length;
			for (i = 0; i < n; ++i) if (c(w[i], st)) break;
			r = i < n;
			break;
		case 5/* ObjectDecl */:
			w = q[4];
			n = w.length;
			for (i = 0; i < n; ++i) if (c(w[i], st)) break;
			r = i < n;
			break;
		case 6/* EnsureArray */: r = c(q[3], st); break;
		case 7/* Ident */: r = false; break;
		case 8/* Self */: r = false; break;
		case 9/* Other */: r = false; break;
		case 10/* Script */: r = false; break;
		case 11/* Const */: r = false; break;
		case 12/* ArgConst */: r = false; break;
		case 13/* ArgIndex */: r = c(q[3], st); break;
		case 14/* ArgCount */: r = false; break;
		case 15/* Call */:
			if (c(q[3], st)) {
				r = true;
			} else {
				w = q[4];
				n = w.length;
				for (i = 0; i < n; ++i) if (c(w[i], st)) break;
				r = i < n;
			}
			break;
		case 16/* CallScript */:
			w = q[4];
			n = w.length;
			for (i = 0; i < n; ++i) if (c(w[i], st)) break;
			r = i < n;
			break;
		case 17/* CallScriptAt */:
			if (c(q[3], st)) {
				r = true;
			} else {
				w = q[5];
				n = w.length;
				for (i = 0; i < n; ++i) if (c(w[i], st)) break;
				r = i < n;
			}
			break;
		case 18/* CallScriptId */:
			if (c(q[3], st)) {
				r = true;
			} else {
				w = q[4];
				n = w.length;
				for (i = 0; i < n; ++i) if (c(w[i], st)) break;
				r = i < n;
			}
			break;
		case 19/* CallField */:
			if (c(q[3], st)) {
				r = true;
			} else {
				w = q[5];
				n = w.length;
				for (i = 0; i < n; ++i) if (c(w[i], st)) break;
				r = i < n;
			}
			break;
		case 20/* CallFunc */:
			w = q[4];
			n = w.length;
			for (i = 0; i < n; ++i) if (c(w[i], st)) break;
			r = i < n;
			break;
		case 21/* CallFuncAt */:
			if (c(q[3], st)) {
				r = true;
			} else {
				w = q[5];
				n = w.length;
				for (i = 0; i < n; ++i) if (c(w[i], st)) break;
				r = i < n;
			}
			break;
		case 22/* Prefix */: r = c(q[3], st); break;
		case 23/* Postfix */: r = c(q[3], st); break;
		case 24/* UnOp */: r = c(q[3], st); break;
		case 25/* BinOp */: r = c(q[4], st) || c(q[5], st); break;
		case 26/* SetOp */: r = c(q[4], st) || c(q[5], st); break;
		case 27/* ToBool */: r = c(q[3], st); break;
		case 28/* FromBool */: r = c(q[3], st); break;
		case 29/* In */: r = c(q[3], st) || c(q[4], st); break;
		case 30/* Local */: r = false; break;
		case 31/* LocalSet */: r = c(q[4], st); break;
		case 32/* LocalAop */: r = c(q[5], st); break;
		case 33/* Global */: r = false; break;
		case 34/* GlobalSet */: r = c(q[4], st); break;
		case 35/* GlobalAop */: r = c(q[5], st); break;
		case 36/* Field */: r = c(q[3], st); break;
		case 37/* FieldSet */: r = c(q[3], st) || c(q[5], st); break;
		case 38/* FieldAop */: r = c(q[3], st) || c(q[6], st); break;
		case 39/* Env */: r = false; break;
		case 40/* EnvSet */: r = c(q[4], st); break;
		case 41/* EnvAop */: r = c(q[5], st); break;
		case 42/* EnvFd */: r = c(q[3], st); break;
		case 43/* EnvFdSet */: r = c(q[3], st) || c(q[5], st); break;
		case 44/* EnvFdAop */: r = c(q[3], st) || c(q[6], st); break;
		case 45/* Env1d */: r = c(q[4], st); break;
		case 46/* Env1dSet */: r = c(q[4], st) || c(q[5], st); break;
		case 47/* Env1dAop */: r = c(q[4], st) || c(q[6], st); break;
		case 48/* Index */: r = c(q[3], st) || c(q[4], st); break;
		case 49/* IndexSet */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 50/* IndexAop */: r = c(q[3], st) || c(q[4], st) || c(q[6], st); break;
		case 51/* IndexPrefix */: r = c(q[3], st) || c(q[4], st); break;
		case 52/* IndexPostfix */: r = c(q[3], st) || c(q[4], st); break;
		case 53/* Index2d */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 54/* Index2dSet */: r = c(q[3], st) || c(q[4], st) || c(q[5], st) || c(q[6], st); break;
		case 55/* Index2dAop */: r = c(q[3], st) || c(q[4], st) || c(q[5], st) || c(q[7], st); break;
		case 56/* Index2dPrefix */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 57/* Index2dPostfix */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 58/* RawId */: r = c(q[3], st) || c(q[4], st); break;
		case 59/* RawIdSet */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 60/* RawIdAop */: r = c(q[3], st) || c(q[4], st) || c(q[6], st); break;
		case 61/* RawIdPrefix */: r = c(q[3], st) || c(q[4], st); break;
		case 62/* RawIdPostfix */: r = c(q[3], st) || c(q[4], st); break;
		case 63/* RawId2d */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 64/* RawId2dSet */: r = c(q[3], st) || c(q[4], st) || c(q[5], st) || c(q[6], st); break;
		case 65/* RawId2dAop */: r = c(q[3], st) || c(q[4], st) || c(q[5], st) || c(q[7], st); break;
		case 66/* RawId2dPrefix */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 67/* RawId2dPostfix */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 68/* DsList */: r = c(q[3], st) || c(q[4], st); break;
		case 69/* DsListSet */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 70/* DsListAop */: r = c(q[3], st) || c(q[4], st) || c(q[6], st); break;
		case 71/* DsListPrefix */: r = c(q[3], st) || c(q[4], st); break;
		case 72/* DsListPostfix */: r = c(q[3], st) || c(q[4], st); break;
		case 73/* DsMap */: r = c(q[3], st) || c(q[4], st); break;
		case 74/* DsMapSet */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 75/* DsMapAop */: r = c(q[3], st) || c(q[4], st) || c(q[6], st); break;
		case 76/* DsMapPrefix */: r = c(q[3], st) || c(q[4], st); break;
		case 77/* DsMapPostfix */: r = c(q[3], st) || c(q[4], st); break;
		case 78/* DsGrid */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 79/* DsGridSet */: r = c(q[3], st) || c(q[4], st) || c(q[5], st) || c(q[6], st); break;
		case 80/* DsGridAop */: r = c(q[3], st) || c(q[4], st) || c(q[5], st) || c(q[7], st); break;
		case 81/* DsGridPrefix */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 82/* DsGridPostfix */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 83/* VarDecl */:
			var l_value2 = q[4];
			r = l_value2 != null && c(l_value2, st);
			break;
		case 84/* Block */:
			w = q[3];
			n = w.length;
			for (i = 0; i < n; ++i) if (c(w[i], st)) break;
			r = i < n;
			break;
		case 85/* IfThen */:
			var l_not1 = q[5];
			r = c(q[3], st) || c(q[4], st) || l_not1 != null && c(l_not1, st);
			break;
		case 86/* Ternary */: r = c(q[3], st) || c(q[4], st) || c(q[5], st); break;
		case 87/* Switch */:
			var o = q[5];
			var m = q[4];
			if (c(q[3], st)) {
				r = true;
			} else {
				n = m.length;
				for (i = 0; i < n; ++i) {
					w = m[i].values;
					l = w.length;
					for (k = 0; k < l; ++k) if (c(w[k], st)) break;
					if (k < l || c(m[i].expr, st)) break;
				}
				if (i < n) {
					r = true;
				} else r = o != null && c(o, st);
			}
			break;
		case 88/* Wait */: r = c(q[3], st); break;
		case 89/* Fork */: r = false; break;
		case 90/* While */: r = c(q[3], st) || c(q[4], st); break;
		case 91/* DoUntil */: r = c(q[3], st) || c(q[4], st); break;
		case 92/* DoWhile */: r = c(q[3], st) || c(q[4], st); break;
		case 93/* Repeat */: r = c(q[3], st) || c(q[4], st); break;
		case 94/* For */: r = c(q[3], st) || c(q[4], st) || c(q[5], st) || c(q[6], st); break;
		case 95/* With */: r = c(q[3], st) || c(q[4], st); break;
		case 96/* Once */: r = c(q[3], st); break;
		case 97/* Return */: r = c(q[3], st); break;
		case 98/* Exit */: r = false; break;
		case 99/* Break */: r = false; break;
		case 100/* Continue */: r = false; break;
		case 101/* Debugger */: r = false; break;
		case 102/* TryCatch */: r = c(q[3], st) || c(q[5], st); break;
		case 103/* Throw */: r = c(q[3], st); break;
		case 104/* CommentLine */: r = false; break;
		case 105/* CommentLinePre */: r = c(q[4], st); break;
		case 106/* CommentLinePost */: r = c(q[3], st); break;
		case 107/* CommentLineSep */: r = c(q[4], st); break;
		case 108/* CommentBlock */: r = false; break;
		case 109/* CommentBlockPre */: r = c(q[4], st); break;
		case 110/* CommentBlockPost */: r = c(q[3], st); break;
	}
	if (st != null) st.shift();
	return r;
}
//}
//{ ast._GmlOp.GmlOp_Impl_
function ast__GmlOp_GmlOp_Impl__getPriority(op) {
	return op >> 4;
}
function ast__GmlOp_GmlOp_Impl__isBoolean(this1) {
	switch (this1) {
		case 64: case 65: case 66: case 67: case 68: case 69: case 80: case 96: return true;
		default: return false;
	}
}
function ast__GmlOp_GmlOp_Impl__toJS(this1) {
	var o = this1;
	return "0x" + "0123456789ABCDEF".charAt(o >> 4) + "0123456789ABCDEF".charAt(o & 15) + "/* " + ast__GmlOp_GmlOp_Impl__toString(this1) + " */";
}
function ast__GmlOp_GmlOp_Impl__toString(this1) {
	switch (this1) {
		case -1: return "";
		case 0: return "*";
		case 1: return "/";
		case 2: return "%";
		case 3: return "div";
		case 16: return "+";
		case 17: return "-";
		case 18: return "+";
		case 32: return "<<";
		case 33: return ">>";
		case 48: return "|";
		case 49: return "&";
		case 50: return "^";
		case 64: return "==";
		case 65: return "!=";
		case 66: return "<";
		case 67: return "<=";
		case 68: return ">";
		case 69: return ">=";
		case 80: return "&&";
		case 96: return "||";
		default: return ast__GmlOp_GmlOp_Impl__getName(this1);
	}
}
function ast__GmlOp_GmlOp_Impl__getName(this1) {
	switch (this1) {
		case -1: return "Set";
		case 0: return "Mul";
		case 1: return "Div";
		case 2: return "Mod";
		case 3: return "IDiv";
		case 7: return "priorities";
		case 16: return "Add";
		case 17: return "Sub";
		case 18: return "Cct";
		case 32: return "Shl";
		case 33: return "Shr";
		case 48: return "Or";
		case 49: return "And";
		case 50: return "Xor";
		case 64: return "EQ";
		case 65: return "NE";
		case 66: return "LT";
		case 67: return "LE";
		case 68: return "GT";
		case 69: return "GE";
		case 80: return "BAnd";
		case 96: return "BOr";
		default: return null;
	}
}
//}
//{ ast.GmlPos
function ast_GmlPos(src, row, col) {
	this.src = src;
	this.row = row;
	this.col = col;
}
ast_GmlPos.prototype = {
	toString: function() {
		return this.src.name + ("[L" + this.row + ",c" + this.col + "]");
	}
}
//}
//{ ast.GmlScript
function ast_GmlScript(src, name, pos) {
	this.namedArgs = null;
	this.arguments = 0;
	this.locals = 0;
	this.localMap = Object.create(null);
	this.source = src;
	this.name = name;
	this.pos = pos;
}
//}
//{ ast.GmlSource
function ast_GmlSource(name, code, main) {
	if (main == null) main = null;
	this.name = name;
	this.code = code;
	if (main == null) {
		main = name;
		var i;
		while (true) {
			i = main.indexOf("/");
			if (i < 0) i = main.indexOf("\\");
			if (i >= 0) main = main.substring(i + 1);
			if (!(i >= 0)) break;
		}
		i = main.indexOf(".");
		if (i >= 0) main = main.substring(0, i);
	}
	this.main = main;
	this.length = code.length;
	var start = -1;
	var row = 1;
	while (true) {
		var next = code.indexOf("\n", start + 1);
		if (next >= 0) {
			++row;
			start = next;
		} else break;
	}
	this.eof = new ast_GmlPos(this, row, this.length - start);
}
//}
//{ ast.GmlToken
var ast_GmlToken = { __ename__: true }
function ast_GmlToken_Header(d, name, lb) {
	var r = ["Header", 0, d, name, lb];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_Macro(d) {
	var r = ["Macro", 1, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_Hash(d) {
	var r = ["Hash", 2, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_Semico(d) {
	var r = ["Semico", 3, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_Comma(d) {
	var r = ["Comma", 4, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_Period(d) {
	var r = ["Period", 5, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_Colon(d) {
	var r = ["Colon", 6, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_QMark(d) {
	var r = ["QMark", 7, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_AtSign(d) {
	var r = ["AtSign", 8, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_Keyword(d, kw) {
	var r = ["Keyword", 9, d, kw];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_Ident(d, id) {
	var r = ["Ident", 10, d, id];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_Env(d, id) {
	var r = ["Env", 11, d, id];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_Undefined(d) {
	var r = ["Undefined", 12, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_Number(d, nu, src) {
	var r = ["Number", 13, d, nu, src];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_CString(d, st) {
	var r = ["CString", 14, d, st];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_UnOp(d, op) {
	var r = ["UnOp", 15, d, op];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_In(d) {
	var r = ["In", 16, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_Adjfix(d, inc) {
	var r = ["Adjfix", 17, d, inc];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_BinOp(d, op) {
	var r = ["BinOp", 18, d, op];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_SetOp(d, op) {
	var r = ["SetOp", 19, d, op];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_ParOpen(d) {
	var r = ["ParOpen", 20, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_ParClose(d) {
	var r = ["ParClose", 21, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_SqbOpen(d) {
	var r = ["SqbOpen", 22, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_SqbClose(d) {
	var r = ["SqbClose", 23, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_CubOpen(d) {
	var r = ["CubOpen", 24, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_CubClose(d) {
	var r = ["CubClose", 25, d];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_ArgConst(d, i) {
	var r = ["ArgConst", 26, d, i];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_CommentPost(d, s) {
	var r = ["CommentPost", 27, d, s];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_CommentLine(d, s) {
	var r = ["CommentLine", 28, d, s];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
function ast_GmlToken_CommentBlock(d, s, pl) {
	var r = ["CommentBlock", 29, d, s, pl];
	r.__enum__ = ast_GmlToken;
	r.toString = sfjs_toString;
	return r;
}
//}
//{ gml.SeekAdjfix
function gml_SeekAdjfix_proc(q, st) {
	switch (q[1]/* ast.GmlNode */) {
		case 22/* Prefix */:
			var x = q[3];
			var pre = q[1] == 22;
			var o;
			var inBlock = ast_GmlNodeTools_isInBlock(x, st[0]);
			if (pre || inBlock) {
				switch (x[1]/* ast.GmlNode */) {
					case 68/* DsList */: SfEnumTools_setTo(q, ast_GmlNode_DsListPrefix(q[2], x[3], x[4], q[4])); break;
					case 73/* DsMap */: SfEnumTools_setTo(q, ast_GmlNode_DsMapPrefix(q[2], x[3], x[4], q[4])); break;
					case 78/* DsGrid */: SfEnumTools_setTo(q, ast_GmlNode_DsGridPrefix(q[2], x[3], x[4], x[5], q[4])); break;
				}
			} else switch (x[1]/* ast.GmlNode */) {
				case 68/* DsList */: SfEnumTools_setTo(q, ast_GmlNode_DsListPostfix(q[2], x[3], x[4], q[4])); break;
				case 73/* DsMap */: SfEnumTools_setTo(q, ast_GmlNode_DsMapPostfix(q[2], x[3], x[4], q[4])); break;
				case 78/* DsGrid */: SfEnumTools_setTo(q, ast_GmlNode_DsGridPostfix(q[2], x[3], x[4], x[5], q[4])); break;
			}
			break;
		case 23/* Postfix */:
			var x1 = q[3];
			var pre1 = q[1] == 22;
			var o1;
			var inBlock1 = ast_GmlNodeTools_isInBlock(x1, st[0]);
			if (pre1 || inBlock1) {
				switch (x1[1]/* ast.GmlNode */) {
					case 68/* DsList */: SfEnumTools_setTo(q, ast_GmlNode_DsListPrefix(q[2], x1[3], x1[4], q[4])); break;
					case 73/* DsMap */: SfEnumTools_setTo(q, ast_GmlNode_DsMapPrefix(q[2], x1[3], x1[4], q[4])); break;
					case 78/* DsGrid */: SfEnumTools_setTo(q, ast_GmlNode_DsGridPrefix(q[2], x1[3], x1[4], x1[5], q[4])); break;
				}
			} else switch (x1[1]/* ast.GmlNode */) {
				case 68/* DsList */: SfEnumTools_setTo(q, ast_GmlNode_DsListPostfix(q[2], x1[3], x1[4], q[4])); break;
				case 73/* DsMap */: SfEnumTools_setTo(q, ast_GmlNode_DsMapPostfix(q[2], x1[3], x1[4], q[4])); break;
				case 78/* DsGrid */: SfEnumTools_setTo(q, ast_GmlNode_DsGridPostfix(q[2], x1[3], x1[4], x1[5], q[4])); break;
			}
			break;
	}
	return ast_GmlNodeTools_seek(q, st, GmlProgram_seekFunc);
}
//}
//{ gml.SeekAlertWith
function gml_SeekAlertWith_proc(q, st) {
	if (q[1] == 95) return GmlProgram_seekInst.error("Cannot compile a with-loop before the runtime loads.", q[2]);
	return ast_GmlNodeTools_seek(q, st, GmlProgram_seekFunc);
}
//}
//{ gml.SeekArguments
function gml_SeekArguments_proc(q, st) {
	ast_GmlNodeTools_seek(q, st, GmlProgram_seekFunc);
	switch (q[1]/* ast.GmlNode */) {
		case 12/* ArgConst */:
			var i = q[3];
			if (GmlProgram_seekScript.arguments <= i) GmlProgram_seekScript.arguments = i + 1;
			break;
		case 13/* ArgIndex */: SfEnumTools_setTo(q, ast_GmlNode_ArgIndex(q[2], ast_GmlNodeTools_offset(q[3], 2))); break;
		case 14/* ArgCount */:
			var d2 = q[2];
			SfEnumTools_setTo(q, ast_GmlNode_BinOp(d2, 17, ast_GmlNode_ArgCount(d2), ast_GmlNode_Number(d2, 2, null)));
			break;
	}
	return false;
}
//}
//{ gml.SeekBool
function gml_SeekBool_proc(q, st) {
	ast_GmlNodeTools_seek(q, st, GmlProgram_seekFunc);
	var x2bp, c;
	switch (q[1]/* ast.GmlNode */) {
		case 24/* UnOp */: if (q[4] == 1) {
			c = q[3];
		} else c = null; break;
		case 25/* BinOp */:
			switch (q[3]) {
				case 80: case 96:
					var c1 = q[5];
					var a = q[4];
					var o = q[3];
					if (!ast_GmlNodeTools_isBoolean(a)) {
						x2bp = a[2];
						SfEnumTools_setTo(a, ast_GmlNode_BinOp(x2bp, 68, ast_GmlNodeTools_clone(a), ast_GmlNode_Number(x2bp, 0.5, null)));
					}
					c = c1;
					break;
				default: c = null;
			}
			break;
		case 85/* IfThen */: c = q[3]; break;
		case 86/* Ternary */: c = q[3]; break;
		case 90/* While */: c = q[3]; break;
		case 91/* DoUntil */: c = q[4]; break;
		case 92/* DoWhile */: c = q[4]; break;
		case 94/* For */: c = q[4]; break;
		default: c = null;
	}
	if (c != null && !ast_GmlNodeTools_isBoolean(c)) {
		x2bp = c[2];
		SfEnumTools_setTo(c, ast_GmlNode_BinOp(x2bp, 68, ast_GmlNodeTools_clone(c), ast_GmlNode_Number(x2bp, 0.5, null)));
	}
	var p = st[0];
	if (p != null && ast_GmlNodeTools_isBoolean(q)) {
		var wrap;
		switch (p[1]/* ast.GmlNode */) {
			case 24/* UnOp */: wrap = (p[4] == 1) ? false : true; break;
			case 25/* BinOp */:
				switch (p[3]) {
					case 80: case 96: wrap = false; break;
					default: wrap = true;
				}
				break;
			case 85/* IfThen */: wrap = q != p[3]; break;
			case 86/* Ternary */: wrap = q != p[3]; break;
			case 90/* While */: wrap = q != p[3]; break;
			case 91/* DoUntil */: wrap = q != p[4]; break;
			case 92/* DoWhile */: wrap = q != p[4]; break;
			case 94/* For */: wrap = q != p[4]; break;
			default: wrap = true;
		}
		if (wrap) SfEnumTools_setTo(q, ast_GmlNode_FromBool(q[2], ast_GmlNodeTools_clone(q)));
	}
	return false;
}
//}
//{ gml.SeekCalls
function gml_SeekCalls_proc(q, st) {
	var i, n, s;
	if (q[1] == 15) {
		var w = q[4];
		var x = q[3];
		var d = q[2];
		switch (x[1]/* ast.GmlNode */) {
			case 7/* Ident */:
				var s1 = x[3];
				if (gml_func_argc[s1] != null) {
					var n1 = gml_func_argc[s1];
					if (n1 < 0 || w.length == n1) {
						SfEnumTools_setTo(q, ast_GmlNode_CallFunc(d, s1, w));
					} else return GmlProgram_seekInst.error("Wrong number of arguments for `" + s1 + "`", q[2]);
				} else return GmlProgram_seekInst.error("`" + s1 + "` is not a function or script", x[2]);
				break;
			case 10/* Script */:
				var o = x[3];
				n = o.arguments;
				s = o.name;
				if (n <= 0 || w.length == n) {
					SfEnumTools_setTo(q, ast_GmlNode_CallScript(d, s, w));
				} else return GmlProgram_seekInst.error("Wrong number of arguments for `" + s + "`", d);
				break;
			case 36/* Field */:
				var s2 = x[4];
				if (gml_func_argc[s2] != null) {
					if (gml_inst_data[s2] != null) {
						SfEnumTools_setTo(q, ast_GmlNode_CallFuncAt(d, x[3], s2, w));
					} else return GmlProgram_seekInst.error("`" + s2 + "` cannot be called on an instance", x[2]);
				} else if (GmlProgram_seekInst.scriptMap[s2] != null) {
					n = GmlProgram_seekInst.scriptMap[s2].arguments;
					if (n <= 0 || w.length == n) {
						SfEnumTools_setTo(q, ast_GmlNode_CallScriptAt(d, x[3], s2, w));
					} else return GmlProgram_seekInst.error("Wrong number of arguments for `" + s2 + "`", d);
				} else SfEnumTools_setTo(q, ast_GmlNode_CallField(d, x[3], s2, w));
				break;
			default: return GmlProgram_seekInst.error("Expression is not callable", x[2]);
		}
	}
	return ast_GmlNodeTools_seek(q, st, GmlProgram_seekFunc);
}
//}
//{ gml.SeekEnumFields
function gml_SeekEnumFields_proc(q, st) {
	if (ast_GmlNodeTools_seek(q, st, GmlProgram_seekFunc)) return true;
	if (q[1] == 36) {
		var f = q[4];
		var x = q[3];
		var d = q[2];
		if (x[1] == 7) {
			var s = x[3];
			var e = GmlProgram_seekInst.enumMap[s];
			if (e != null) {
				var c = e.ctrMap[f];
				if (c != null) {
					SfEnumTools_setTo(q, ast_GmlNode_EnumCtr(d, e, c));
					return false;
				} else return GmlProgram_seekInst.error("Enum `" + s + "` does not contain field `" + f + "`", d);
			}
		}
		if (gml_var_flags[f] != null) {
			if ((gml_var_flags[f] & 4) != 0) {
				SfEnumTools_setTo(q, ast_GmlNode_EnvFd(d, x, f));
			} else return GmlProgram_seekInst.error("`" + f + "` is not an instance-specific variable.", d);
		}
	}
	return false;
}
//}
//{ gml.SeekEnumValues
function gml_SeekEnumValues_proc() {
	var _g = 0;
	var _g1 = GmlProgram_seekInst.enums;
	while (_g < _g1.length) {
		var e = _g1[_g];
		++_g;
		var next = 0;
		var _g2 = 0;
		var _g3 = e.ctrList;
		while (_g2 < _g3.length) {
			var c = _g3[_g2];
			++_g2;
			if (c.node != null) {
				var st = [];
				var _seekFunc = GmlProgram_seekFunc;
				GmlProgram_seekFunc = gml_SeekIdents_proc;
				GmlProgram_seekScript = null;
				gml_SeekIdents_proc(c.node, st);
				GmlProgram_seekFunc = _seekFunc;
				gml_SeekEval_eval(c.node);
				var v = gml_SeekEval_nodeToValue(c.node);
				if (typeof(v) == "number") {
					c.value = Math.floor(v);
					next = c.value + 1;
				} else if (v != gml_SeekEval_invalidValue) {
					return GmlProgram_seekInst.error("Enum values should be integer", c.node[2]);
				} else return GmlProgram_seekInst.error("Enum values should be constant", c.node[2]);
			} else c.value = next++;
		}
	}
	return false;
}
//}
//{ gml.SeekEval
function gml_SeekEval_nodeToValue(node) {
	switch (node[1]/* ast.GmlNode */) {
		case 0/* Undefined */: return null;
		case 1/* Number */: return node[3];
		case 2/* CString */: return node[3];
		case 11/* Const */: return gml_const_val[node[3]];
		default: return gml_SeekEval_invalidValue;
	}
}
function gml_SeekEval_valueToNode(val, d) {
	if (typeof(val) == "number") {
		return ast_GmlNode_Number(d, val, null);
	} else if (typeof(val) == "string") {
		return ast_GmlNode_CString(d, val);
	} else if (val == null) {
		return ast_GmlNode_Undefined(d);
	} else return null;
}
function gml_SeekEval_proc(q, st) {
	var f1, f2;
	var z = true;
	var v1, v2, i, n;
	switch (q[1]/* ast.GmlNode */) {
		case 0/* Undefined */: break;
		case 1/* Number */: break;
		case 2/* CString */: break;
		case 11/* Const */: break;
		case 20/* CallFunc */:
			var args = q[4];
			n = args.length;
			for (i = 0; i < n; ++i) if (gml_SeekEval_proc(args[i], st)) z = false;
			break;
		case 25/* BinOp */:
			if (q[3] == 16) {
				var b = q[5];
				var a = q[4];
				var d = q[2];
				if (gml_SeekEval_proc(a, st)) z = false;
				if (gml_SeekEval_proc(b, st)) z = false;
				if (z) {
					v1 = gml_SeekEval_nodeToValue(a);
					v2 = gml_SeekEval_nodeToValue(b);
					if (typeof(v1) == "string") {
						if (typeof(v2) == "string") {
							SfEnumTools_setTo(q, ast_GmlNode_CString(d, v1 + v2));
						} else if (b[1] == 25) {
							if (b[3] == 16) {
								if (b[4][1] == 2) {
									SfEnumTools_setTo(q, ast_GmlNode_BinOp(d, 16, ast_GmlNode_CString(d, v1 + b[4][3]), b[5]));
								} else {
									gml_SeekEval_errorText = "Can't add " + a[0] + " and " + b[0] + " at compile time";
									gml_SeekEval_errorPos = q[2];
									z = false;
								}
							} else {
								gml_SeekEval_errorText = "Can't add " + a[0] + " and " + b[0] + " at compile time";
								gml_SeekEval_errorPos = q[2];
								z = false;
							}
						} else {
							gml_SeekEval_errorText = "Can't add " + a[0] + " and " + b[0] + " at compile time";
							gml_SeekEval_errorPos = q[2];
							z = false;
						}
					} else if (typeof(v1) == "number") {
						if (typeof(v2) == "number") {
							SfEnumTools_setTo(q, ast_GmlNode_Number(d, v1 + v2, null));
						} else {
							gml_SeekEval_errorText = "Can't add " + a[0] + " and " + b[0] + " at compile time";
							gml_SeekEval_errorPos = q[2];
							z = false;
						}
					} else if (typeof(v2) == "string") {
						if (a[1] == 25) {
							if (a[3] == 16) {
								if (a[5][1] == 2) {
									SfEnumTools_setTo(q, ast_GmlNode_BinOp(d, 16, a[4], ast_GmlNode_CString(d, a[5][3] + v2)));
								} else {
									gml_SeekEval_errorText = "Can't add " + a[0] + " and " + b[0] + " at compile time";
									gml_SeekEval_errorPos = q[2];
									z = false;
								}
							} else {
								gml_SeekEval_errorText = "Can't add " + a[0] + " and " + b[0] + " at compile time";
								gml_SeekEval_errorPos = q[2];
								z = false;
							}
						} else {
							gml_SeekEval_errorText = "Can't add " + a[0] + " and " + b[0] + " at compile time";
							gml_SeekEval_errorPos = q[2];
							z = false;
						}
					} else {
						gml_SeekEval_errorText = "Can't add " + a[0] + " and " + b[0] + " at compile time";
						gml_SeekEval_errorPos = q[2];
						z = false;
					}
				}
			} else {
				var b1 = q[5];
				var a1 = q[4];
				var d1 = q[2];
				var o = q[3];
				if (gml_SeekEval_proc(a1, st)) z = false;
				if (gml_SeekEval_proc(b1, st)) z = false;
				if (z) {
					v1 = gml_SeekEval_nodeToValue(a1);
					v2 = gml_SeekEval_nodeToValue(b1);
					if (typeof(v1) == "number" && typeof(v2) == "number") {
						f1 = v1;
						f2 = v2;
						switch (o) {
							case 0: f1 *= f2; break;
							case 1: f1 /= f2; break;
							case 2: f1 %= f2; break;
							case 3: f1 = f1 / (f2 | 0) | 0; break;
							case 16: f1 += f2; break;
							case 17: f1 -= f2; break;
							case 32: f1 = (f1 | 0) << (f2 | 0); break;
							case 33: f1 = (f1 | 0) >> (f2 | 0); break;
							case 48: f1 = f1 | 0 | (f2 | 0); break;
							case 49: f1 = (f1 | 0) & (f2 | 0); break;
							case 50: f1 = (f1 | 0) ^ (f2 | 0); break;
							case 64: f1 = (f1 == f2) ? 1 : 0; break;
							case 65: f1 = (f1 != f2) ? 1 : 0; break;
							case 66: f1 = (f1 < f2) ? 1 : 0; break;
							case 67: f1 = (f1 <= f2) ? 1 : 0; break;
							case 68: f1 = (f1 > f2) ? 1 : 0; break;
							case 69: f1 = (f1 >= f2) ? 1 : 0; break;
							case 80: f1 = (f1 > 0.5 && f2 > 0.5) ? 1 : 0; break;
							case 96: f1 = (f1 > 0.5 || f2 > 0.5) ? 1 : 0; break;
							default:
								gml_SeekEval_errorText = "Can't apply " + ast__GmlOp_GmlOp_Impl__getName(o);
								gml_SeekEval_errorPos = q[2];
								z = false;
						}
						if (z) SfEnumTools_setTo(q, ast_GmlNode_Number(d1, f1, null));
					} else {
						gml_SeekEval_errorText = "Can't apply " + ast__GmlOp_GmlOp_Impl__getName(o) + " to " + a1[0] + " and " + b1[0];
						gml_SeekEval_errorPos = q[2];
						z = false;
					}
				}
			}
			break;
		default:
			if (gml_SeekEval_evalRec) {
				if (ast_GmlNodeTools_seek(q, st, gml_SeekEval_proc)) z = false;
			} else {
				gml_SeekEval_errorText = q[0] + " doesn't seem to be a constant expression.";
				gml_SeekEval_errorPos = q[2];
				z = false;
			}
	}
	return !z;
}
function gml_SeekEval_eval(q) {
	gml_SeekEval_evalRec = false;
	return gml_SeekEval_proc(q, null);
}
function gml_SeekEval_opt() {
	gml_SeekEval_evalRec = true;
	GmlProgram_seekInst.seek(gml_SeekEval_proc);
	return false;
}
//}
//{ gml.SeekIdents
function gml_SeekIdents_proc(q, st) {
	if (q[1] == 7) {
		var s = q[3];
		var d = q[2];
		var scr = GmlProgram_seekScript;
		if (scr != null && scr.namedArgs[s] != null) {
			SfEnumTools_setTo(q, ast_GmlNode_ArgConst(d, scr.namedArgs[s]));
		} else if (scr != null && scr.localMap[s] != null) {
			SfEnumTools_setTo(q, ast_GmlNode_Local(d, s));
		} else if (GmlProgram_seekInst.macros[s] != null) {
			SfEnumTools_setTo(q, ast_GmlNodeTools_clone(GmlProgram_seekInst.macros[s]));
			gml_SeekIdents_proc(q, st);
		} else if (gml_var_flags[s] != null) {
			SfEnumTools_setTo(q, ast_GmlNode_Env(d, s));
			if (st.length > 0) {
				var _g = st[0];
				switch (_g[1]/* ast.GmlNode */) {
					case 48/* Index */: if ((gml_var_flags[s] & 2) != 0) {
						SfEnumTools_setTo(st[0], ast_GmlNode_Env1d(_g[2], s, _g[4]));
					} else return GmlProgram_seekInst.error("`" + s + "` is not an array.", _g[2]); break;
					case 53/* Index2d */: return GmlProgram_seekInst.error("`" + s + "` is not a 2d array.", _g[2]);
					default: if ((gml_var_flags[s] & 2) != 0) SfEnumTools_setTo(q, ast_GmlNode_Env1d(d, s, ast_GmlNode_Number(d, 0, null)));
				}
			}
		} else if (gml_const_map[s] != null) {
			SfEnumTools_setTo(q, ast_GmlNode_Const(d, s));
		} else if (GmlProgram_seekInst.scriptMap[s] != null) SfEnumTools_setTo(q, ast_GmlNode_Script(d, GmlProgram_seekInst.scriptMap[s]));
	}
	return ast_GmlNodeTools_seek(q, st, GmlProgram_seekFunc);
}
//}
//{ gml.SeekLocals
function gml_SeekLocals_proc(q, st) {
	switch (q[1]/* ast.GmlNode */) {
		case 83/* VarDecl */:
			var s = q[3];
			if (GmlProgram_seekScript.localMap[s] == null) GmlProgram_seekScript.localMap[s] = GmlProgram_seekScript.locals++;
			break;
		case 102/* TryCatch */:
			var s1 = q[4];
			if (GmlProgram_seekScript.localMap[s1] == null) GmlProgram_seekScript.localMap[s1] = GmlProgram_seekScript.locals++;
			break;
	}
	return ast_GmlNodeTools_seek(q, st, GmlProgram_seekFunc);
}
//}
//{ gml.SeekMergeBlocks
function gml_SeekMergeBlocks_proc(q, st) {
	ast_GmlNodeTools_seek(q, st, GmlProgram_seekFunc);
	if (q[1] == 84) {
		var w = q[3];
		for (var i = 0; i < w.length; ++i) {
			var _g = w[i];
			if (_g[1] == 84) {
				var w2 = _g[3];
				w.splice(i, 1);
				var k = w2.length;
				while (--k >= 0) {
					w.splice(i, 0, w2[k]);
				}
			}
		}
	}
	return false;
}
//}
//{ gml.SeekRepeat
function gml_SeekRepeat_proc(q, st) {
	ast_GmlNodeTools_seek(q, st, GmlProgram_seekFunc);
	if (q[1] == 93) {
		var x = q[4];
		var t = q[3];
		var d = q[2];
		var ind = 0;
		var _g = 0;
		while (_g < st.length) {
			var sx = st[_g];
			++_g;
			if (sx[1] == 93) ++ind;
		}
		var v = "$repeat";
		if (ind > 0) v += ind;
		SfEnumTools_setTo(q, ast_GmlNode_For(d, ast_GmlNode_VarDecl(d, v, t), ast_GmlNode_BinOp(d, 69, ast_GmlNode_Local(d, v), ast_GmlNode_Number(d, 1, null)), ast_GmlNode_SetOp(d, 17, ast_GmlNode_Local(d, v), ast_GmlNode_Number(d, 1, null)), x));
	}
	return false;
}
//}
//{ gml.SeekSelfFields
function gml_SeekSelfFields_proc(q, st) {
	if (q[1] == 7) {
		var s = q[3];
		var d = q[2];
		SfEnumTools_setTo(q, ast_GmlNode_Field(d, ast_GmlNode_Self(d), s));
	}
	return ast_GmlNodeTools_seek(q, st, GmlProgram_seekFunc);
}
//}
//{ gml.SeekSetOp
function gml_SeekSetOp_resolveSetOp_rfn(q, st) {
	switch (q[1]/* ast.GmlNode */) {
		case 26/* SetOp */:
			if (ast_GmlNodeTools_equals(gml_SeekSetOp_resolveSetOp_xw, q[4])) {
				gml_SeekSetOp_resolveSetOp_safe = q[5][1] == 4;
				return true;
			}
			break;
		case 49/* IndexSet */:
			if (ast_GmlNodeTools_equals(gml_SeekSetOp_resolveSetOp_xw, q[3])) {
				gml_SeekSetOp_resolveSetOp_safe = true;
				return true;
			}
			break;
		case 50/* IndexAop */:
			if (ast_GmlNodeTools_equals(gml_SeekSetOp_resolveSetOp_xw, q[3])) {
				gml_SeekSetOp_resolveSetOp_safe = true;
				return true;
			}
			break;
		case 54/* Index2dSet */:
			if (ast_GmlNodeTools_equals(gml_SeekSetOp_resolveSetOp_xw, q[3])) {
				gml_SeekSetOp_resolveSetOp_safe = true;
				return true;
			}
			break;
		case 55/* Index2dAop */:
			if (ast_GmlNodeTools_equals(gml_SeekSetOp_resolveSetOp_xw, q[3])) {
				gml_SeekSetOp_resolveSetOp_safe = true;
				return true;
			}
			break;
	}
	return ast_GmlNodeTools_seekAll(q, st, gml_SeekSetOp_resolveSetOp_rfn);
}
function gml_SeekSetOp_proc(q, st) {
	if (q[1] == 26) {
		var v = q[5];
		var x = q[4];
		var o = q[3];
		var d = q[2];
		var _g = ast_GmlNodeTools_unpack(x);
		switch (_g[1]/* ast.GmlNode */) {
			case 12/* ArgConst */: break;
			case 13/* ArgIndex */: break;
			case 30/* Local */: if (o != -1) {
				SfEnumTools_setTo(q, ast_GmlNode_LocalAop(d, _g[3], o, v));
			} else SfEnumTools_setTo(q, ast_GmlNode_LocalSet(d, _g[3], v)); break;
			case 33/* Global */: if (o != -1) {
				SfEnumTools_setTo(q, ast_GmlNode_GlobalAop(d, _g[3], o, v));
			} else SfEnumTools_setTo(q, ast_GmlNode_GlobalSet(d, _g[3], v)); break;
			case 36/* Field */: if (o != -1) {
				SfEnumTools_setTo(q, ast_GmlNode_FieldAop(d, _g[3], _g[4], o, v));
			} else SfEnumTools_setTo(q, ast_GmlNode_FieldSet(d, _g[3], _g[4], v)); break;
			case 39/* Env */:
				var s3 = _g[3];
				var f = gml_var_flags[s3];
				if ((f & 1) == 0) {
					if ((f & 2) != 0) {
						var k = ast_GmlNode_Number(d, 0, null);
						if (o != -1) {
							SfEnumTools_setTo(q, ast_GmlNode_Env1dAop(d, s3, k, o, v));
						} else SfEnumTools_setTo(q, ast_GmlNode_Env1dSet(d, s3, k, v));
					} else if (o != -1) {
						SfEnumTools_setTo(q, ast_GmlNode_EnvAop(d, s3, o, v));
					} else SfEnumTools_setTo(q, ast_GmlNode_EnvSet(d, s3, v));
				} else return GmlProgram_seekInst.error("`" + s3 + "` is read-only", _g[2]);
				break;
			case 42/* EnvFd */:
				var s4 = _g[4];
				if ((gml_var_flags[s4] & 1) == 0) {
					if (o != -1) {
						SfEnumTools_setTo(q, ast_GmlNode_EnvFdAop(d, _g[3], s4, o, v));
					} else SfEnumTools_setTo(q, ast_GmlNode_EnvFdSet(d, _g[3], s4, v));
				} else return GmlProgram_seekInst.error("`" + s4 + "` is read-only", _g[2]);
				break;
			case 45/* Env1d */:
				var s5 = _g[3];
				if ((gml_var_flags[s5] & 1) == 0) {
					if (o != -1) {
						SfEnumTools_setTo(q, ast_GmlNode_Env1dAop(d, s5, _g[4], o, v));
					} else SfEnumTools_setTo(q, ast_GmlNode_Env1dSet(d, s5, _g[4], v));
				} else return GmlProgram_seekInst.error("`" + s5 + "` is read-only", _g[2]);
				break;
			case 48/* Index */:
				var xw = _g[3];
				var xd3 = _g[2];
				switch (x[1]/* ast.GmlNode */) {
					case 48/* Index */: if (o != -1) {
						SfEnumTools_setTo(q, ast_GmlNode_IndexAop(xd3, xw, x[4], o, v));
					} else SfEnumTools_setTo(q, ast_GmlNode_IndexSet(xd3, xw, x[4], v)); break;
					case 53/* Index2d */: if (o != -1) {
						SfEnumTools_setTo(q, ast_GmlNode_Index2dAop(xd3, xw, x[4], x[5], o, v));
					} else SfEnumTools_setTo(q, ast_GmlNode_Index2dSet(xd3, xw, x[4], x[5], v)); break;
				}
				gml_SeekSetOp_resolveSetOp_safe = false;
				gml_SeekSetOp_resolveSetOp_xw = xw;
				ast_GmlNodeTools_seekAllOut(q, st, gml_SeekSetOp_resolveSetOp_rfn, 0);
				if (!gml_SeekSetOp_resolveSetOp_safe) SfEnumTools_setTo(q, ast_GmlNode_Block(xd3, [ast_GmlNode_EnsureArray(xd3, ast_GmlNodeTools_clone(xw)), ast_GmlNodeTools_clone(q)]));
				break;
			case 53/* Index2d */:
				var xw1 = _g[3];
				var xd4 = _g[2];
				switch (x[1]/* ast.GmlNode */) {
					case 48/* Index */: if (o != -1) {
						SfEnumTools_setTo(q, ast_GmlNode_IndexAop(xd4, xw1, x[4], o, v));
					} else SfEnumTools_setTo(q, ast_GmlNode_IndexSet(xd4, xw1, x[4], v)); break;
					case 53/* Index2d */: if (o != -1) {
						SfEnumTools_setTo(q, ast_GmlNode_Index2dAop(xd4, xw1, x[4], x[5], o, v));
					} else SfEnumTools_setTo(q, ast_GmlNode_Index2dSet(xd4, xw1, x[4], x[5], v)); break;
				}
				gml_SeekSetOp_resolveSetOp_safe = false;
				gml_SeekSetOp_resolveSetOp_xw = xw1;
				ast_GmlNodeTools_seekAllOut(q, st, gml_SeekSetOp_resolveSetOp_rfn, 0);
				if (!gml_SeekSetOp_resolveSetOp_safe) SfEnumTools_setTo(q, ast_GmlNode_Block(xd4, [ast_GmlNode_EnsureArray(xd4, ast_GmlNodeTools_clone(xw1)), ast_GmlNodeTools_clone(q)]));
				break;
			case 58/* RawId */: if (o != -1) {
				SfEnumTools_setTo(q, ast_GmlNode_RawIdAop(d, _g[3], _g[4], o, v));
			} else SfEnumTools_setTo(q, ast_GmlNode_RawIdSet(d, _g[3], _g[4], v)); break;
			case 63/* RawId2d */: if (o != -1) {
				SfEnumTools_setTo(q, ast_GmlNode_RawId2dAop(d, _g[3], _g[4], _g[5], o, v));
			} else SfEnumTools_setTo(q, ast_GmlNode_RawId2dSet(d, _g[3], _g[4], _g[5], v)); break;
			case 68/* DsList */: if (o != -1) {
				SfEnumTools_setTo(q, ast_GmlNode_DsListAop(d, _g[3], _g[4], o, v));
			} else SfEnumTools_setTo(q, ast_GmlNode_DsListSet(d, _g[3], _g[4], v)); break;
			case 73/* DsMap */: if (o != -1) {
				SfEnumTools_setTo(q, ast_GmlNode_DsMapAop(d, _g[3], _g[4], o, v));
			} else SfEnumTools_setTo(q, ast_GmlNode_DsMapSet(d, _g[3], _g[4], v)); break;
			case 78/* DsGrid */: if (o != -1) {
				SfEnumTools_setTo(q, ast_GmlNode_DsGridAop(d, _g[3], _g[4], _g[5], o, v));
			} else SfEnumTools_setTo(q, ast_GmlNode_DsGridSet(d, _g[3], _g[4], _g[5], v)); break;
			default: return GmlProgram_seekInst.error("Expression is not settable", x[2]);
		}
	}
	return ast_GmlNodeTools_seek(q, st, GmlProgram_seekFunc);
}
//}
//{ haxe.StackItem
var haxe_StackItem = { __ename__: true }
function haxe_StackItem_CFunction() {
	var r = ["CFunction", 0];
	r.__enum__ = haxe_StackItem;
	r.toString = sfjs_toString;
	return r;
}
function haxe_StackItem_Module(m) {
	var r = ["Module", 1, m];
	r.__enum__ = haxe_StackItem;
	r.toString = sfjs_toString;
	return r;
}
function haxe_StackItem_FilePos(s, file, line) {
	var r = ["FilePos", 2, s, file, line];
	r.__enum__ = haxe_StackItem;
	r.toString = sfjs_toString;
	return r;
}
function haxe_StackItem_Method(classname, method) {
	var r = ["Method", 3, classname, method];
	r.__enum__ = haxe_StackItem;
	r.toString = sfjs_toString;
	return r;
}
function haxe_StackItem_LocalFunction(v) {
	var r = ["LocalFunction", 4, v];
	r.__enum__ = haxe_StackItem;
	r.toString = sfjs_toString;
	return r;
}
//}
//{ haxe.CallStack
function haxe_CallStack_getStack(e) {
	if (e == null) return [];
	var oldValue = Error.prepareStackTrace;
	Error.prepareStackTrace = function(error, callsites) {
		var stack = [];
		var _g = 0;
		while (_g < callsites.length) {
			var site = callsites[_g];
			++_g;
			if (haxe_CallStack_wrapCallSite != null) site = haxe_CallStack_wrapCallSite(site);
			var method = null;
			var fullName = site.getFunctionName();
			if (fullName != null) {
				var idx = fullName.lastIndexOf(".");
				if (idx >= 0) method = haxe_StackItem_Method(HxOverrides_substr(fullName, 0, idx), HxOverrides_substr(fullName, idx + 1, null));
			}
			stack.push(haxe_StackItem_FilePos(method, site.getFileName(), site.getLineNumber()));
		}
		return stack;
	}
	var a = haxe_CallStack_makeStack(e.stack);
	Error.prepareStackTrace = oldValue;
	return a;
}
function haxe_CallStack_callStack() {
	try {
		throw new Error();
	} catch (e) {
		var a = haxe_CallStack_getStack(e);
		a.shift();
		return a;
	}
}
function haxe_CallStack_makeStack(s) {
	if (s == null) {
		return [];
	} else if (typeof(s) == "string") {
		var stack = s.split("\n");
		if (stack[0] == "Error") stack.shift();
		var m = [];
		var rie10 = new EReg("^   at ([A-Za-z0-9_. ]+) \\(([^)]+):([0-9]+):([0-9]+)\\)$", "");
		var _g = 0;
		while (_g < stack.length) {
			var line = stack[_g];
			++_g;
			if (rie10.match(line)) {
				var path = rie10.matched(1).split(".");
				var meth = path.pop();
				m.push(haxe_StackItem_FilePos((meth == "Anonymous function") ? haxe_StackItem_LocalFunction() : (meth == "Global code") ? null : haxe_StackItem_Method(path.join("."), meth), rie10.matched(2), Std_parseInt(rie10.matched(3))));
			} else m.push(haxe_StackItem_Module(StringTools_trim(line)));
		}
		return m;
	} else return s;
}
//}
//{ js._Boot.HaxeError
function js__Boot_HaxeError_wrap(val) {
	if ((val instanceof Error)) {
		return val;
	} else return new js__Boot_HaxeError(val);
}
function js__Boot_HaxeError(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if (Error.captureStackTrace) Error.captureStackTrace(this, js__Boot_HaxeError);
}
sfjs_extend(js__Boot_HaxeError, Error, { });
//}
//{ js.Boot
function js_Boot___string_rec(o, s) {
	if (o == null) return "null";
	if (s.length >= 5) return "<...>";
	var t = typeof(o);
	if (t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch (t) {
		case "function": return "<function>";
		case "object":
			if (o instanceof Array) {
				if (o.__enum__) {
					if (o.length == 2) return o[0];
					var str = o[0] + "(";
					s += "\t";
					var i = 2;
					for (var _g = o.length; i < _g; i++) if (i != 2) {
						str += "," + js_Boot___string_rec(o[i], s);
					} else str += js_Boot___string_rec(o[i], s);
					return str + ")";
				}
				var l = o.length;
				var i1;
				var str1 = "[";
				s += "\t";
				var i2 = 0;
				for (var _g2 = l; i2 < _g2; i2++) str1 += ((i2 > 0) ? "," : "") + js_Boot___string_rec(o[i2], s);
				str1 += "]";
				return str1;
			}
			var tostr;
			try {
				tostr = o.toString;
			} catch (e) {
				return "???";
			}
			if (tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
				var s2 = o.toString();
				if (s2 != "[object Object]") return s2;
			}
			var k = null;
			var str2 = "{\n";
			s += "\t";
			var hasp = o.hasOwnProperty != null;
			for( var k in o ) {;
			if (hasp && !o.hasOwnProperty(k)) continue;
			if (k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") continue;
			if (str2.length != 2) str2 += ", \n";
			str2 += s + k + " : " + js_Boot___string_rec(o[k], s);
			};
			s = s.substring(1);
			str2 += "\n" + s + "}";
			return str2;
		case "string": return o;
		default: return String(o);
	}
}
//}
//{ tools._AceWrap.AceWrap_Impl_
function tools__AceWrap_AceWrap_Impl__resetHintError(this1) {
	var mk = this1.errorMarker;
	if (mk != null) {
		this1.getSession().removeMarker(mk);
		this1.errorMarker = null;
	}
}
function tools__AceWrap_AceWrap_Impl__setHintText(this1, msg) {
	var hint = this1.statusHint;
	hint.classList.remove("active");
	hint.textContent = msg;
	hint.onclick = null;
	this1.getSession().clearAnnotations();
}
function tools__AceWrap_AceWrap_Impl__setHintError(this1, msg, pos) {
	var Range1 = ace.require("ace/range").Range;
	var row = pos.row - 1;
	var col = pos.col - 1;
	var range = new Range1(row, col, row, col + 1);
	var hint = this1.statusHint;
	hint.classList.add("active");
	hint.textContent = msg;
	hint.onclick = function(_) {
		this1.gotoLine(row + 1, col);
	}
	var session = this1.getSession();
	this1.errorMarker = session.addMarker(range, "ace_error-line", "fullLine");
	session.setAnnotations([{
		row: row, 
		column: col, 
		type: "error", 
		text: msg
	}]);
}
//}
//{ tools.GmlBuffer
function tools_GmlBuffer() {
	this.semicoAfter = -1;
	this.indent = 0;
	StringBuf.call(this);
}
sfjs_extend(tools_GmlBuffer, StringBuf, {
	addLine: function() {
		this.b += "\n";
		var k = this.indent;
		while (--k >= 0) {
			this.b += "\t";
		}
	}
});
//}
//{ vm._GmlValue.GmlValue_Impl_
function vm__GmlValue_GmlValue_Impl__print_rec(v, z) {
	var r, i, n, w;
	if (v == null) {
		return "undefined";
	} else if (typeof(v) == "number") {
		return Std_string(v);
	} else if (typeof(v) == "string") {
		return '"' + v + '"';
	} else return Std_string(v);
}
function vm__GmlValue_GmlValue_Impl__print(this1) {
	return vm__GmlValue_GmlValue_Impl__print_rec(this1, 0);
}
//}
var GmlParser_errorText;
var GmlParser_errorPos;
var GmlParser_temRow;
var GmlParser_temRowStart;
var GmlParser_temEnd;
var GmlPrint_printProgram = null;
var GmlPrint_printScript = null;
var GmlPrint_self = "gml$self";
var GmlPrint_other = "gml$other";
var GmlPrint_withDepth = 0;
var GmlProgram_seekInst;
var GmlProgram_seekFunc;
var GmlProgram_seekScript;
var GmlWeb_gameFrame;
var GmlWeb_gameMode;
var GmlWeb_gameScript;
var GmlWeb_editorArea;
var GmlWeb_path;
var GmlWeb_params;
var gml_SeekEval_errorText;
var gml_SeekEval_errorPos;
var gml_SeekEval_evalRec;
var gml_SeekEval_invalidValue = [];
var gml_SeekSetOp_resolveSetOp_safe;
var gml_SeekSetOp_resolveSetOp_xw;
var haxe_CallStack_wrapCallSite;
GmlWeb_main();
// Generated at 2018-01-07 00:42:24 (7863ms)
