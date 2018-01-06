window.searchParameters = (function() {
	var search = location.search;
	var r = Object.create(null);
	var p = search.indexOf("?");
	if (search == "" || p < 0) return r;
	var pairs = search.substring(p + 1).split("&");
	for (var i = 0; i < pairs.length; i++) {
		var pair = pairs[i];
		p = pair.indexOf("=");
		if (p >= 0) {
			r[pair.substring(0, p)] = pair.substring(p + 1);
		} else r[pair] = "";
	}
	return r;
})();
window.sampleGML = '#define main\n// init code here\n\n#define step\n// update code here\n\n#define draw\n// draw code here\nscr_show("Hello world!");\n\n#define scr_show\n// define scripts like this\ndraw_text(4, 4, argument0);';
//{ base64 (haxe-generated)
var base64_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function base64_s2b(s) {
	var a = [], i = 0;
	while (i < s.length) {
		var c = s.charCodeAt(i++);
		if (55296 <= c && c <= 56319) c = c - 55232 << 10 | s.charCodeAt(i++) & 1023;
		if (c <= 127) {
			a.push(c);
		} else if (c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if (c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return a;
}
function base64_b2s(b) {
	var s = "", fcc = String.fromCharCode, i = 0, max = b.length;
	while (i < max) {
		var c = b[i++];
		if (c < 128) {
			if (c == 0) break;
			s += fcc(c);
		} else if (c < 224) {
			s += fcc((c & 63) << 6 | b[i++] & 127);
		} else if (c < 240) {
			s += fcc((c & 31) << 12 | (b[i++] & 127) << 6 | b[i++] & 127);
		} else {
			var u = (c & 15) << 18 | (b[i++] & 127) << 12 | (b[i++] & 127) << 6 | b[i++] & 127;
			s += fcc((u >> 10) + 55232);
			s += fcc(u & 1023 | 56320);
		}
	}
	return s;
}
function base64_encode(s) {
	var c = base64_chars, b = base64_s2b(s), n = b.length, r = "", i;
	for (i = 0; i < n; i += 3) {
		r += c.charAt(b[i] >> 2);
		r += c.charAt((b[i] & 3) << 4 | b[i + 1] >> 4);
		r += c.charAt((b[i + 1] & 15) << 2 | b[i + 2] >> 6);
		r += c.charAt(b[i + 2] & 63);
	}
	if (n % 3 == 2) {
		r = r.substring(0, r.length - 1) + "=";
	} else if (n % 3 == 1) r = r.substring(0, r.length - 2) + "==";
	return r;
}
function base64_decode(s) {
	var c = base64_chars;
	var r = [];
	var n = s.length;
	var i = 0;
	while (i < n) {
		var e1 = c.indexOf(s.charAt(i++));
		var e2 = c.indexOf(s.charAt(i++));
		var e3 = c.indexOf(s.charAt(i++));
		var e4 = c.indexOf(s.charAt(i++));
		r.push(e1 << 2 | e2 >> 4);
		r.push((e2 & 15) << 4 | e3 >> 2);
		r.push((e3 & 3) << 6 | e4 & 63);
	}
	if (s.charCodeAt(n - 1) == 61) r.pop();
	if (s.charCodeAt(n - 2) == 61) r.pop();
	return base64_b2s(r);
}
//}
//{ https://github.com/pieroxy/lz-string/
var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);

//}
(function() { // parameters
	var lsq = window.localStorage, v;
	function load(s) { return lsq ? lsq.getItem(s) : null; }
	function save(k, v) { lsq && lsq.setItem(k, v); }
	function eid(k) { return document.getElementById(k); }
	function getCode() { return window.editor ? window.editor.getValue() : eid("source").value; }
	var sp = window.searchParameters;
	// load splitter size:
	v = sp.cw || load("gmlpen-editor-width");
	v = v && parseFloat(v) || 512;
	eid("editor-td").setAttribute("width", v);
	// load saved code from URL or LS:
	if (v = sp.lzgml) try {
		v = LZString.decompressFromEncodedURIComponent(v);
	} catch (_) {
		v = "// decoding error.";
	} else if (v = sp.gml) try {
		v = base64_decode(v);
	} catch (_) {
		v = "// decoding error.";
	} else v = load("gmlpen-code") || window.sampleGML;
	if (v) eid("source").value = v;
	// load mode:
	if (sp.gml) {
		v = sp.mode;
	} else v = load("gmlpen-mode");
	eid("mode").value = v || "2d";
	// UI basics:
	eid("refresh").onclick = eid("reload").onclick = function(_) {
		save("gmlpen-code", getCode());
	};
	eid("share").onclick = function(_) {
		var params = [];
		params.push("mode=" + eid("mode").value);
		var v = getCode();
		var v1 = "lzgml=" + LZString.compressToEncodedURIComponent(v);
		var v2 = "gml=" + base64_encode(v);
		params.push(v1.length < v2.length ? v1 : v2);
		var code = location.origin + location.pathname + "?" + params.join("&");
		var size = code.length;
		if (size < 10000) {
			size += "B";
		} else {
			size /= 1024;
			size = size.toFixed(2) + "KB";
		}
		eid("sharing-size").textContent = size;
		eid("sharing-code").value = code;
		eid("sharing").style.display = "";
		eid("sharing-code").select();
	};
})();
(function() { // splitter
	var sp = document.getElementById("splitter-td");
	var eq = document.getElementById("editor-td");
	var gq = document.getElementById("main");
	var ls = window.localStorage;
	var sp_mousemove, sp_mouseup, sp_x, sp_y;
	sp_mousemove = function(e) {
		var nx = e.pageX, dx = nx - sp_x; sp_x = nx;
		var ny = e.pageY, dy = ny - sp_y; sp_y = ny;
		eq.setAttribute("width", parseFloat(eq.getAttribute("width")) +
			dx * (eq.parentElement.children[0] == eq ? 1 : -1));
	};
	sp_mouseup = function(e) {
		document.removeEventListener("mousemove", sp_mousemove);
		document.removeEventListener("mouseup", sp_mouseup);
		gq.classList.remove("resizing");
		if (ls) ls.setItem("gmlpen-editor-width", "" + eq.getAttribute("width"));
	};
	sp.addEventListener("mousedown", function(e) {
		sp_x = e.pageX; sp_y = e.pageY;
		document.addEventListener("mousemove", sp_mousemove);
		document.addEventListener("mouseup", sp_mouseup);
		gq.classList.add("resizing");
		e.preventDefault();
	});
})();
//
