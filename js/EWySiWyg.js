/**
 * EWySiWyg editor
 * Version: 1.0
 * Copyright: Oleksandr Drozd <dev.drozd@gmail.com>.
*/
$.fn.EWySiWyg = function(p) {

	/*
	 * Options
	 */
	var opts = typeof p == 'object' ? p : Object.assign({
		plugins: '*',
		spellcheck: true,
	},p);

	/*
	 * Compiling editor
	 */
	this.each(function() {
		var _t = this;
		_t.className = 'ewswg-body';
		_t.style.display = 'none';
		$(_t).bind('paste blur', function() {
			_t.parentNode.querySelector('div.ewswg-body').innerHTML = _t.value;
		})
		var body = $('<div/>', {
				class: 'ewswg-body',
				contenteditable: true,
				spellcheck: opts.spellcheck,
				html: _t.value
			}).bind('mousedown', function(e) {
				switch (e.target.tagName) {
					case 'A':
						$.EWySiWyg.editLink(e);
					break;
				}
			}).bind('paste blur', function() {
				_t.value = this.innerHTML;
			}),
			head = $('<div/>', {
				class: 'ewswg-head'
			}),
			parent = $('<div/>', {
				class: 'ewswg',
				html: head
			}).append(body);
		$.EWySiWyg.body = body;
		$.EWySiWyg.textarea = _t;
		$.each($.EWySiWyg.methods, function(method, fn) {
			var plugins = opts.plugins;
			if (plugins && plugins !== '*') {
				var arr = plugins.replace(/\s+/g, '').split(',');
				return arr.indexOf(method) >= 0 ? fn.apply($.EWySiWyg, [head, body]) : null;
			} else
				return fn.apply($.EWySiWyg, [head, body]);
		});
		$(_t).after(parent).appendTo(parent);
	});
};

/*
 * Object editor
 */
$.EWySiWyg = new function(_w, _d) {

	/*
	 * Localization
	 */
	this.lang = {
		resize: 'Full Screen',
		undo: 'Back',
		redo: 'Forward',
		bold: 'Bold',
		italic: 'italic',
		strike: 'strikeout',
		underline: 'underlined',
		left: 'Align Left',
		center: 'Centered',
		right: 'Align Right',
		list: 'List',
		numlist: 'Numbered list',
		quote: 'Tsytata',
		hr: 'Horizontal Line',
		format: 'Format',
		code: 'Show code',
		color: 'Text Color',
		background: 'The background color of the text',
		text: 'Text',
		size: 'font size',
		header: 'Title'
	};
	
	this.modal = function(a){
		$('<div/>', {
			class: 'ewswg-modal',
			html: $('<div/>', {
				html: '<div>'+a.title+'<i onclick="$(this).parents(\'.ewswg-modal\').remove()">&#10006;</i></div>'+a.content
			})
		}).appendTo('body');
	};

	/*
	 * Link Editing
	 */
	this.editLink = function(e, b,c) {
		var _t = this;
		if (b) {
			var _s = _t.getSelection(),
				_r = _t.getRange(_t.body, e),
				_l = '';
		} else {
			var el = $(e.target),
				_s = el.html(),
				_l = el.attr('href');
		}
		
		
		this.modal({
			title: 'Adding link',
			content: '<div>\
				<label>Text:</label>\
				<input type="text" name="text" value="' + _s + '">\
			</div>\
			<div>\
				<label>Link:</label>\
				<input type="text" name="link" value="' + _l + '">\
			</div>\
			<div>\
				<button>Insert</button>\
			</div>'
		});
		
		$('.ewswg-modal button').click(function() {
			var text = $('.ewswg-modal input[name="text"]').val(),
				link = $('.ewswg-modal input[name="link"]').val();
			if (b) {
				_s.removeAllRanges();
				if (_r) _s.addRange(_r);
				console.log(_t.body[0], '<a href="' + link + '" target="blank_">' + text + '</a>');
				_t.command(c, 'insertHTML', false, '<a href="' + link + '" target="blank_">' + text + '</a>', e);
			} else
				el.html(text).attr('href', link);
			$('.ewswg-modal').remove();
		});
	};

	/*
	 * The selected area
	 */
	this.getSelection = function() {
		return _w.getSelection ? _w.getSelection() : '';
	};

	/*
	 * Executing commands
	 */
	this.command = function(a, b, c, d, e) {
		e.preventDefault();
		var s = this.getSelection(a),
			rc = false;
		if (s && s.rangeCount) {
			var r = s.getRangeAt(0);
			rc = r.commonAncestorContainer || (
				r.parentElement ? r.parentElement() : r.item(0)
			);
		}
		while (rc && rc != a[0]) rc = rc.parentNode;
		if (!rc) this.setFocus(a[0], false, true);
		_d.execCommand(b, c, d);
	};

	/*
	 * Get range
	 */
	this.getRange = function(a, e) {
		e.preventDefault();
		var s = this.getSelection(a);
		return s.rangeCount ? s.getRangeAt(0) : null;
	};

	/*
	 * Setting the focus to the editor
	 */
	this.setFocus = function(e) {
		if (typeof _w.getSelection != 'undefined' && typeof _d.createRange != 'undefined') {
			var s = _w.getSelection(),
				r = _d.createRange();
			r.selectNodeContents(e);
			r.collapse(false);
			var s = _w.getSelection();
			s.removeAllRanges();
			s.addRange(r);
		} else if (typeof _d.body.createTextRange != 'undefined') {
			var r = _d.body.createTextRange();
			r.moveToElementText(e);
			r.collapse(false);
			r.select();
		}
	};

	/*
	 * Compile button
	 */
	this.createButton = function(e, p) {
		function item(el, obj) {
			$.each(obj, function(title, o) {
				$.each(o, function(a, b) {
					var button = $('<i/>', {
						class: a,
						title: title
					});
					if (typeof b === 'function') {
						button.mousedown(b)
					} else {
						var button = $('<div/>', {
							html: button
						}).append($('<div/>', {
							class: 'ewswg-drop' + (b[2] ? ' ' + b[2] : ''),
							html: b[0]
						}).mousedown(b[1]));
					}
					$(el).append(button);
					
					window.ff = button;
				});
			});
		}
		if (p.length) {
			var group = $('<div/>').appendTo(e);
			$.each(p, function() {
				item(group, this);
			});
		} else
			item(e, p);
	};

	/*
	 * Methods
	 */
	this.methods = {

		// Full screen mode
		resize: function(a, form) {
			var resize = this.lang.resize;
			console.log(this.lang.resize);
			this.createButton(a, {
				[resize]: {
					'icon-resize-full ewswg-resize': function(e) {
						if ($(a).parent().hasClass('ewswg-full-screen')) {
							$('body').css('overflow', '');
							$(a).find('.ewswg-resize')
								.addClass('fa-expand')
								.removeClass('fa-compress')
								.parents('.ewswg')
								.removeClass('ewswg-full-screen');
						} else {
							$(a).find('.ewswg-resize')
								.removeClass('fa-expand')
								.addClass('fa-compress')
								.parents('.ewswg')
								.addClass('ewswg-full-screen');
							$('body').css('overflow', 'hidden');
						}
					}
				}
			});
		},

		// Font Style
		style: function(a, b) {
			var _t = this,
				l = _t.lang,
				bold = l.bold,
				italic = l.italic,
				strike = l.strike,
				underline = l.underline;
			this.createButton(a, [{
				[bold]: {
					'icon-bold': function(e) {
						console.log('work', e);
						_t.command(b, 'bold', false, null, e);
					}
				}
			}, {
				italic: {
					'icon-italic': function(e) {
						_t.command(b, 'italic', false, null, e);
					}
				}
			}, {
				strike: {
					'icon-strike': function(e) {
						_t.command(b, 'strikeThrough', false, null, e);
					}
				}
			}, {
				underline: {
					'icon-underline': function(e) {
						_t.command(b, 'underline', false, null, e);
					}
				}
			}]);
		},

		// Alignment
		aligment: function(a, b) {
			var _t = this,
				l = _t.lang,
				left = l.left,
				center = l.center,
				right = l.right;
			this.createButton(a, [{
				left: {
					'icon-align-left': function(e) {
						_t.command(b, 'justifyLeft', false, null, e);
					}
				}
			}, {
				center: {
					'icon-align-center': function(e) {
						_t.command(b, 'justifyCenter', false, null, e);
					}
				}
			}, {
				right: {
					'icon-align-right': function(e) {
						_t.command(b, 'justifyRight', false, null, e);
					}
				}
			}, {
				full: {
					'icon-align-justify': function(e) {
						_t.command(b, 'justifyFull', false, null, e);
					}
				}
			}]);
		},

		// Indent
		indent: function(a, b) {
			var _t = this,
				l = _t.lang,
				indent = l.indent,
				outdent = l.outdent;
			this.createButton(a, [{
				indent: {
					'icon-indent-right': function(e) {
						_t.command(b, 'indent', false, null, e);
					}
				}
			}, {
				outdent: {
					'icon-indent-left': function(e) {
						_t.command(b, 'outdent', false, null, e);
					}
				}
			}]);
		},

		// Lists
		list: function(a, b) {
			var _t = this,
				l = _t.lang,
				list = l.list,
				numlist = l.numlist;
			this.createButton(a, [{
				list: {
					'icon-list': function(e) {
						_t.command(b, 'insertUnorderedList', false, null, e);
					}
				}
			}, {
				numlist: {
					'icon-list-numbered': function(e) {
						_t.command(b, 'insertOrderedList', false, null, e);
					}
				}
			}]);
		},

		// Inserts
		insert: function(a, b) {
			var _t = this,
				l = _t.lang,
				quote = l.quote,
				hr = l.hr,
				th = '',
				tw = 10,
				tc = 0;
			for (var i = 1; i <= 100; i++) {
				if (tc < 10) tc++;
				else tc = 1;
				var h = 10 * tc;
				th += '<span data-row="' + i + '" style="width:' + tw + '%;height:' + h + '%;z-index:' + (100 - i) + '" title="' + (h / 10) + ',' + (tw / 10) + '"></span>';
				if (h == 100) tw = tw + 10;
			}
			this.createButton(a, [{
				quote: {
					'icon-quote-left': function(e) {
						var sel = _t.getSelection(b);
						if (sel) {
							_t.command(b, 'insertHTML', false, '<blockquote>' + sel + '</blockquote>&nbsp;', e);
						}
					}
				}
			}, {
				hr: {
					'icon-minus': function(e) {
						_t.command(b, 'InsertHorizontalRule', true, '', e);
					}
				}
			}, {
				link: {
					'icon-link': function(e) {
						_t.editLink(e, true, b);
					}
				}
			}, {
				table: {
					'icon-table': [th, function(e) {
						var num = e.target.getAttribute('title'),
							rows = '',
							_s = _t.getSelection(),
							_r = _t.getRange(b, e);
						if (num) {
							var len = num.split(',');
							for (var i = 0; i < len[0]; i++) {
								rows += '<tr>';
								for (var j = 0; j < len[1]; j++) {
									rows += '<td>&#65279;</td>';
								}
								rows += '</tr>';
							}
							_s.removeAllRanges();
							if (_r) _s.addRange(_r);
							_t.command(b, 'insertHTML', false, '<table cellspacing="5" cellpadding="0">' + rows + '</table>&nbsp;', e);
						}
					}, 'ewswg-table']
				}
			}, {
				image: {
					'icon-picture': function(e) {
						var _s = _t.getSelection(),
							_r = _t.getRange(b, e),
							admin = location.pathname.split('/'),
							preloader = '<div class="loader">\
								<i class="fa fa-cog fa-spin fa-3x fa-fw"></i>\
								<span class="">Image is loading. Please, wait...</span>\
							</div>';
						_t.modal({
							title: 'Insert Image',
							content: '<div>\
								<label>URL:</label>\
								<input type="text" name="url" autofocus>\
							</div>\
							<div>\
								<button class="btn btnSubmit">Insert</button>\
							</div>'
						});
						$('.ewswg-modal button').click(function(){
							var url = $('.ewswg-modal input[name="url"]').val();
							_s.removeAllRanges();
							if (_r) _s.addRange(_r);
							_t.command(b, 'insertHTML', false, '<img src="'+url+'">&nbsp;', e);
							$('.ewswg-modal').remove();
						});
					}
				}
			}, {
				youtube: {
					'icon-youtube': function(e) {
						var _s = _t.getSelection(),
							_r = _t.getRange(b, e);
							console.log(this);
						_t.modal({
							title: 'Youtube link',
							content: '<div>\
								<label>URL:</label>\
								<input type="text" name="url" autofocus>\
							</div>\
							<div>\
								<button class="btn btnSubmit">Insert</button>\
							</div>'
						});
						$('.ewswg-modal button').click(function() {
							var url = $('.ewswg-modal input[name="url"]').val(),
								match = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/);
							if (match && match[1].length === 11) {
								_s.removeAllRanges();
								if (_r) _s.addRange(_r);
								_t.command(b, 'insertHTML', false, '<iframe src="//www.youtube.com/embed/' + match[1] + '" frameborder="0" width="640" height="360"></iframe>&nbsp;', e);
								$('.ewswg-modal').remove();
							} else
								alert('Ссылка не верная');
						});
					}
				}
			}]);
		},

		// Formatting
		code: function(a, b) {
			var _t = this,
				l = _t.lang,
				format = l.format,
				code = l.code;
			this.createButton(a, [{
				format: {
					'icon-eraser': function(e) {
						var sel = _t.getSelection(b);
						if (sel) {
							_t.command(b, 'removeFormat', false, null, e);
						}
					}
				}
			}, {
				code: {
					'icon-code': function(e) {
						if (!b.code) {
							var tr = b.hide().next().show();
							tr.val(tr.val().trim());
							b.code = true;
							$(a).parent().find('.ewswg-head i:not(.icon-code):not(.ewswg-resize)').addClass('disabled');
						} else {
							b.show().next().hide();
							b.code = false;
							$(a).parent().find('.ewswg-head i:not(.icon-code):not(.ewswg-resize)').removeClass('disabled');
						}
					}
				}
			}]);
		},

		// Text and Fonts
		font: function(a, b) {
			var _t = this,
				l = _t.lang,
				color = l.color,
				background = l.background,
				family = l.family,
				size = l.size,
				header = l.header,
				colors = [
					'#fff', '#000', '#eee', '#f00', '#00f', '#F2FB5B', '#EB981B', '#EB567F',
					'#C625DA', '#6DBDF5', '#5BD4B8', '#44C06A', '#6FE760', '#C2C2C2', '#464646',
					'#6bc4c2', '#45bb6f', '#25a6d0', '#25a6d0'
				],
				families = ['cursive', 'fantasy', 'monospace', 'sans-serif', 'serif'],
				ch = '',
				fh = '<ul>',
				fzh = '<ul>',
				hh = '<ul>';
			$.each(colors, function() {
				ch += '<span data-color="' + this + '" style="background: ' + this + '"></span>';
			});
			$.each(families, function() {
				fh += '<li data-family="' + this + '" style="font-family:'+this+';">' + this + '</li>';
			});
			for (var i = 1; i <= 7; i++) {
				fzh += '<li data-size="' + i + '"><font size="' + i + '" data-size="' + i + '">' + l.text + '</font></li>';
			}
			for (var i = 1; i <= 6; i++) {
				hh += '<li data-header="' + i + '" class="h' + i + '">' + header + ' ' + i + '</li>';
			}
			this.createButton(a, [{
				color: {
					'icon-adjust': [ch, function(e) {
						var hex = e.target.getAttribute('data-color');
						if (hex) _t.command(b, 'foreColor', true, hex, e);
					}, 'color']
				}
			}, {
				background: {
					'icon-th': [ch, function(e) {
						var hex = e.target.getAttribute('data-color');
						if (hex) _t.command(b, 'backColor', true, hex, e);
					}, 'color']
				}
			}, {
				family: {
					'icon-font': [fh + '</ul>', function(e) {
						var fn = e.target.getAttribute('data-family');
						if (fn) _t.command(b, 'fontName', true, fn, e);
					}, 'family']
				}
			}, {
				size: {
					'icon-text-height': [fzh + '</ul>', function(e) {
						var fz = e.target.getAttribute('data-size');
						if (fz) _t.command(b, 'fontSize', true, fz, e);
					}, 'size']
				}
			}, {
				header: {
					'icon-header': [hh + '</ul>', function(e) {
						var h = e.target.getAttribute('data-header');
						if (h) _t.command(b, 'formatBlock', true, 'H' + h, e);
					}, 'ewswg-header']
				}
			}]);
		},

		// Navigation
		history: function(a, b) {
			var _t = this,
				l = _t.lang,
				undo = l.undo,
				redo = l.redo;
			this.createButton(a, [{
				undo: {
					'icon-ccw': function(e) {
						_t.command(b, 'undo', false, null, e);
					}
				}
			}, {
				redo: {
					'icon-cw': function(e) {
						_t.command(b, 'redo', false, null, e);
					}
				}
			}]);
		}
	};

}(window, document);
