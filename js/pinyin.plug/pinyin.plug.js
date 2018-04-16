/* 
description: Pinyin, to get chinese pinyin from chinese. 
license: MIT-style 
authors: Bill Lue 
requires: 
    core/1.2.1: '*' 
provides: [Pinyin] 
*/

var pinyin = (function() {
    var Pinyin = function(ops) {
        this.initialize(ops);
    },

    options = {
        checkPolyphone: false,
        upperCase:false
    };

    Pinyin.fn = Pinyin.prototype = {
        init: function(ops) {
            this.options = extend(options, ops);
			return this;
        },

        initialize: function(ops) {
            this.init(ops);
            this.char_dict = g_char_dict;
            this.full_dict = g_full_dict;
            this.polyphone = g_polyphone;
        },

        // 提取拼音, 返回首字母大写形式 
        getFullChars: function(str) {
            var result = '',
            name;
            var reg = new RegExp('[a-zA-Z0-9\- ]');
            for (var i = 0,
            len = str.length; i < len; i++) {
                var ch = str.substr(i, 1),
                unicode = ch.charCodeAt(0);
                if (unicode > 40869 || unicode < 19968) {
                    result += ch;
                } else {
                    name = this._getFullChar(ch);
                    if (name !== false) {
                        result += name;
                    }
                }
            }
            return result;
        },

        // 提取首字母，返回大写形式	
        getCamelChars: function(str) {
            if (typeof(str) !== 'string') throw new Error( - 1, "函数getFisrt需要字符串类型参数!");
            var chars = []; //保存中间结果的数组 
            for (var i = 0,
            len = str.length; i < len; i++) {
                //获得unicode码 
                var ch = str.charAt(i);
                //检查该unicode码是否在处理范围之内,在则返回该码对映汉字的拼音首字母,不在则调用其它函数处理 
                chars.push(this._getChar(ch));
            }
            //处理arrResult,返回所有可能的拼音首字母串数组 
            return this._getResult(chars);
        },

        // 提取拼音 
        _getFullChar: function(str) {
            for (var key in this.full_dict) {
                if ( - 1 !== this.full_dict[key].indexOf(str)) {
                    return this._capitalize(key);
                    break;
                }
            }
            return false;
        },

        // 首字母大写 
        _capitalize: function(str) {
            if (str.length > 0) {
                var first = str.substr(0, 1).toUpperCase();
                var spare = str.substr(1, str.length);
                return first + spare;
            }
        },

        _getChar: function(ch) {
            var unicode = ch.charCodeAt(0);
            //如果不在汉字处理范围之内,返回原字符,也可以调用自己的处理函数 
            if (unicode > 40869 || unicode < 19968) return ch; //dealWithOthers(ch); 
            //检查是否是多音字,是按多音字处理,不是就直接在strChineseFirstPY字符串中找对应的首字母 
			var char="";
            if (!this.options.checkPolyphone){
				char=this.char_dict.charAt(unicode - 19968);
			}else{
            	char=this.polyphone[unicode] ? this.polyphone[unicode] : this.char_dict.charAt(unicode - 19968);
			}
			
			if(!this.options.upperCase){
				char=char.toLowerCase();
			}
			return char;
        },

        _getResult: function(chars) {
            if (!this.options.checkPolyphone) return chars.join('');
            var result = [''];
            for (var i = 0,
            len = chars.length; i < len; i++) {
                var str = chars[i],
                strlen = str.length;
                if (strlen == 1) {
                    for (var j = 0; j < result.length; j++) {
                        result[k] += str;
                    }
                } else {
                    var swap1 = result.slice(0);
                    result = [];
                    for (var j = 0; j < strlen; j++) {
                        //复制一个相同的arrRslt 
                        var swap2 = swap1.slice(0);
                        //把当前字符str[k]添加到每个元素末尾 
                        for (var k = 0; k < swap2.length; k++) {
                            swap2[k] += str.charAt(j);
                        }
                        //把复制并修改后的数组连接到arrRslt上 
                        result = result.concat(swap2);
                    }
                }
            }
            return result;
        }

    };

    var extend = function(dst, src) {
        for (var property in src) {
            dst[property] = src[property];
        }
        return dst;
    };

    return new Pinyin(arguments);
})();

//alert(pinyin.getFullChars("我们是中国人,好用的拼音其")); 