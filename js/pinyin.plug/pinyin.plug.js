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

        // ��ȡƴ��, ��������ĸ��д��ʽ 
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

        // ��ȡ����ĸ�����ش�д��ʽ	
        getCamelChars: function(str) {
            if (typeof(str) !== 'string') throw new Error( - 1, "����getFisrt��Ҫ�ַ������Ͳ���!");
            var chars = []; //�����м��������� 
            for (var i = 0,
            len = str.length; i < len; i++) {
                //���unicode�� 
                var ch = str.charAt(i);
                //����unicode���Ƿ��ڴ���Χ֮��,���򷵻ظ����ӳ���ֵ�ƴ������ĸ,��������������������� 
                chars.push(this._getChar(ch));
            }
            //����arrResult,�������п��ܵ�ƴ������ĸ������ 
            return this._getResult(chars);
        },

        // ��ȡƴ�� 
        _getFullChar: function(str) {
            for (var key in this.full_dict) {
                if ( - 1 !== this.full_dict[key].indexOf(str)) {
                    return this._capitalize(key);
                    break;
                }
            }
            return false;
        },

        // ����ĸ��д 
        _capitalize: function(str) {
            if (str.length > 0) {
                var first = str.substr(0, 1).toUpperCase();
                var spare = str.substr(1, str.length);
                return first + spare;
            }
        },

        _getChar: function(ch) {
            var unicode = ch.charCodeAt(0);
            //������ں��ִ���Χ֮��,����ԭ�ַ�,Ҳ���Ե����Լ��Ĵ����� 
            if (unicode > 40869 || unicode < 19968) return ch; //dealWithOthers(ch); 
            //����Ƿ��Ƕ�����,�ǰ������ִ���,���Ǿ�ֱ����strChineseFirstPY�ַ������Ҷ�Ӧ������ĸ 
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
                        //����һ����ͬ��arrRslt 
                        var swap2 = swap1.slice(0);
                        //�ѵ�ǰ�ַ�str[k]��ӵ�ÿ��Ԫ��ĩβ 
                        for (var k = 0; k < swap2.length; k++) {
                            swap2[k] += str.charAt(j);
                        }
                        //�Ѹ��Ʋ��޸ĺ���������ӵ�arrRslt�� 
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

//alert(pinyin.getFullChars("�������й���,���õ�ƴ����")); 