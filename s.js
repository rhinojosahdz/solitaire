/* 
 Property of Roberto Jaime Hinojosa Hernandez, All rights reserved.
 */

// TODO que te diga cuando ganaste

(function ($) {

    var _this;
    var cards = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8', 'h9', 'h10', 'h11', 'h12', 'h13', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'd9', 'd10', 'd11', 'd12', 'd13', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10', 'c11', 'c12', 'c13'];
    var randomized_cards = [];
    // var path = '';
    // var window.cards_path = path + 'imgs/cards/';
    var drag_began = false;
    var card_position_before_drag;
    var number_of_tableau_cards = 0;
    var shuffle_animation_ended = false;
    var shuffle_animation_speed = 200;
    var shuffle_animation_startup_time = 200;

    var draggable = {
        revert: function (_droppable) {
            if (_droppable && _droppable.data('from_foundation')) {//muy rara vez si arrastramos una carta a foundation y la dropeamos cerca de una carta, el droppable ocurre en esa carta en lugar de foundation aun y cuando esa carta esta dentro de foundation, asi arreglamos esos casos
                _droppable = $('#s-foundation');
            }


            var draggable_card = this;
            var is_card = _droppable && _droppable.attr('id') !== 's-foundation' && !_droppable.hasClass('column');
            var from_tableau = !draggable_card.data('from_stock') && !draggable_card.data('from_foundation');

            var draggable_card_column_before_moving = draggable_card.parent();
            var all_cards = draggable_card.nextAll().andSelf();

            //@bug @todo esto deberia de correrlo antes de hacer el drag, o no?
            if (all_cards.size() > 1) {//necesario ya que al arrastrar varias cartas el droppable puede ocurre en una de las cartas arrastradas, aqui volvemos a hacer la ultima carta droppable
                all_cards.last().droppable(droppable).removeClass('hover_card');//el hover_card normalmente lo quita jquery automaticamente cuando debe, pero creo que dado a que hacemos la validacion manualmente es necesario que lo quite yo.
            }

            var valid = true;

            if (valid && !_droppable) {//si no se droppeo sobre un elemento droppable
                valid = false;
            }

            if (valid && _droppable.data('from_foundation') && all_cards.size() > 1) {//si estamos arrastrando varias cartas e intentamos dropearlas en el foundation
                valid = false;
            }

            if (valid && draggable_card && draggable_card.data('from_foundation') && _droppable && _droppable.attr('id') === 's-foundation') {//se intento dropear una carta de foundation de nuevo en foundation
                valid = false;
            }

            if (valid && _droppable.attr('id') === 's-foundation') {
                if (!_this.s('_card_valid_in_foundation', draggable_card)) {
                    valid = false;
                }
            }

            if (valid & !is_card && _droppable.hasClass('column')) {//se dejo caer en una columna vacia en tableau
                valid = draggable_card.data('number') === 13;
            }

            if (valid && is_card) {//si la carta es de color diferente y un numero menor a la dropeable
                valid = _droppable.data('color') !== draggable_card.data('color')
                        && _droppable.data('number') === (draggable_card.data('number') + 1);
            }

            if (valid) {//valido
//            if (true && _droppable) {//testing, siempre deja poner cualquier carta sobre otra
                if (_droppable.attr('id') === 's-foundation') {
                    _this.s('_add_card_to_foundation_if_valid', draggable_card);
                }
                else {
                    if ((from_tableau) || _droppable.hasClass('column')) {
                        var previous_card_of_draggable_card = draggable_card.prev();
                        if (_droppable.hasClass('column')) {
                            _droppable.append(all_cards);
                            _droppable.droppable('destroy');
                            if (draggable_card.data('from_stock')) {
                                draggable_card.droppable(droppable);
                            }
                        }
                        else {
                            _droppable.after(all_cards);
                            _droppable.droppable('destroy');
                        }

                        if (from_tableau) {
                            if (_this.s('_is_up', previous_card_of_draggable_card)) {
                                previous_card_of_draggable_card.droppable(droppable);
                            }
                            else {
                                _this.s('_flip', previous_card_of_draggable_card);
                                previous_card_of_draggable_card.draggable(draggable).droppable(droppable);
                            }
                        }
                        draggable_card.removeData('from_stock');
                        draggable_card.removeData('from_foundation');
                    }
                    else {
                        _droppable.after(draggable_card);
                        _droppable.droppable('destroy');
                        draggable_card.droppable(droppable);
                        draggable_card.removeData('from_stock');
                        draggable_card.removeData('from_foundation');
                    }

                    //despues de animaciones
                    if (!_droppable.hasClass('column')) {
                        _this.s('_sort_tableau_column', _droppable.parent());
                    }
                    else {
                        _this.s('_sort_tableau_column', _droppable);
                    }

                    if (_this.s('_is_column_empty', draggable_card_column_before_moving)) {
                        if (draggable_card_column_before_moving.parent().attr('id') !== 's-foundation') {
                            draggable_card_column_before_moving.droppable(droppable);
                        }
                    }

                    all_cards.css('z-index', '');
                    //\despues de animaciones
                }
            }
            else {//invalido


                var previous_cards_that_are_up = draggable_card.siblings('.ui-draggable');
                previous_cards_that_are_up.draggable('disable');
                all_cards.draggable('disable');


                var top = 0;
                all_cards.each(function () {
                    $(this).animate({
                        top: parseFloat(card_position_before_drag.top) - (top),
                        left: card_position_before_drag.left
                    }, 500, function () {
                        all_cards.css('z-index', '');



                        all_cards.removeClass('hover_card').draggable('enable');
                        previous_cards_that_are_up.draggable('enable');

                        if (draggable_card.data('from_foundation') && _droppable && _droppable.attr('id') === 's-foundation') {
                            draggable_card.css('z-index', '');//por alguna razon, la cual me dio flojera averiguar (ya que no es necesario), al dropear una carta de foundation de nuevo en foundation, esta se queda con z-index=2, asi removemos el atributo
                        }

                    });
                    top += 140;
                });
            }
            drag_began = false;
        }
        , drag: function (e, ui) {
            if (!drag_began) {
                var card = $(e.target);
                drag_began = true;

                var top = card.css('top');
                var left = card.css('left');
                card_position_before_drag = {top: top, left: left};
                var cards = $(e.target).nextAll().andSelf();
                cards.css('z-index', 2);
                if (cards.length > 1) {
                    cards.last().removeClass('hover_card').droppable('destroy');//necesario ya que al arrastrar 2 cartas el droppable siempre ocurre en la 2nda
                }
            }
            var top = 140;
            $(e.target).nextAll().each(function () {
                $(this).css({
                    top: ui.position.top - (top),
                    left: ui.position.left
                });
                top += 140;
            });
        }
    };
    var droppable = {
        hoverClass: 'hover_card'
    };

    var methods = {
        init: function (settings) {
            _this = this;
            var _settings = $.extend({
            }, settings);

            _this.data('s', _settings);

            _this.s('_randomize_cards');
            _this.s('_deal');
            _this.s('_prepare_cards_for_foundation');
            return this;
        }
        , _is_column_empty: function (column) {
            return !column.children('.card').size();
        }
        , _prepare_cards_for_foundation: function () {
            $('#s-board .card').on('click touchstart', function () {
                return;
                var card = $(this);
                if (card.css('z-index') === '2') {
                    return;
                }
                if (_this.s('_is_down', card)) {//si tiene cartas arriba
                    return;
                }
                if (card.next().size()) {//si tiene cartas arriba
                    return;
                }
                if (card.data('from_foundation')) {//si tiene cartas arriba
                    return;
                }
                _this.s('_add_card_to_foundation_if_valid', card);
            });
            $('#s-foundation').droppable(droppable);
        }
        , _card_valid_in_foundation: function (card) {
            var fc = _this.s('_get_foundation_column', card);

            var last_foundation_card_of_same_suit = fc.children('.card:last');
            if (!last_foundation_card_of_same_suit.size()) {
                if (card.data('number') !== 1) {
                    return false;
                }
            }
            else {
                if (last_foundation_card_of_same_suit.data('number') !== card.data('number') - 1) {
                    return false;
                }
            }
            return true;
        }
        , _add_card_to_foundation_if_valid: function (card) {
            var card_column_before_moving = card.parent();
            if (!_this.s('_is_up', card)) {
                return;
            }

//            if (false)//testing siempre deja poner en foundation
            if (!_this.s('_card_valid_in_foundation', card)) {
                return;
            }
            var fc = _this.s('_get_foundation_column', card);

            card.css({top: '', left: ''});
            if (!card.data('from_stock')) {
                var previous_card = card.prev();
                if (!_this.s('_is_up', card.prev())) {
                    _this.s('_face_up', previous_card.draggable(draggable).droppable(droppable));
                }
                else {
                    previous_card.droppable(droppable);
                }
            }
            else {
                card.droppable(droppable);
            }

            fc.append(card);
            if (_this.s('_is_column_empty', card_column_before_moving)) {
                if (card_column_before_moving.parent().attr('id') !== 's-foundation') {
                    card_column_before_moving.droppable(droppable);
                }
            }
            card.data('from_foundation', true);
            card.css("z-index", '');//en caso de que venga de stock
            card.removeData('from_stock');
        }
        , _get_foundation_column: function (card) {
            var foundation_column;
            switch (card.data('suit')) {
                case's':
                    foundation_column = 'spades';
                    break;
                case'h':
                    foundation_column = 'hearts';
                    break;
                case'd':
                    foundation_column = 'diamonds';
                    break;
                case'c':
                    foundation_column = 'clubs';
                    break;
            }
            return $('#s-foundation>.column.' + foundation_column);
        }
        , _deal_stock: function () {
            for (var i = 0; i < 24; i++) {//realmente es 24
                var string_random_card = randomized_cards.pop();
                var html_card = this.s('_create_html_card', string_random_card);
                $('#s-stock').append(html_card);
                html_card.data('from_stock', true);
            }
        }
        , _prepare_stock: function () {
            var s = $('#s-stock');
            var w = $('#s-waste');
            s.on('click touchstart', function () {
                if (!shuffle_animation_ended) {
                    return;
                }
                if (s.children('.card').size() === 0) {
                    s.append(_this.s('_face_down', w.children('.card').draggable('disable')));
                }
                var card = s.children('.card:first');
                _this.s('_face_up', card);
                w.append(card);
                if (card.hasClass('ui-draggable')) {
                    card.draggable('enable');//.droppable(droppable);
                }
                else {
                    card.draggable(draggable);//.droppable(droppable);
                }
            });
        }
        , _flip: function (cards) {
            cards.each(function () {
                var card = $(this);
                var card_img = card.children('img');
                if (!_this.s('_is_up', card)) {
                    card_img.attr('src', window.cards_path + card.data('suit') + card.data('number') + '.png');
                }
                else {
                    card_img.attr('src', window.cards_path + 'back.png');
                }
            });
            return cards;
        }
        , _face_up: function (cards) {
            cards.each(function () {
                var card = $(this);
                var card_img = card.children('img');
                card_img.attr('src', window.cards_path + card.data('suit') + card.data('number') + '.png');
            });
            return cards;
        }
        , _face_down: function (cards) {
            cards.each(function () {
                var card = $(this);
                var card_img = card.children('img');
                card_img.attr('src', window.cards_path + 'back.png');
            });
            return cards;
        }
        , _is_up: function (card) {
            return card.children('img').attr('src') !== window.cards_path + 'back.png';
        }
        , _is_down: function (card) {
            return !_this.s('_is_up', card);
        }
        , _prepare_front_tableau_cards: function () {
            $('#s-tableau>.column').each(function () {
                _this.s('_flip', $(this).children('.card').last().droppable(droppable).draggable(draggable));
            });
        }
        , _randomize_cards: function () {
            var _cards = cards.slice(0);//lo clonamos
            for (var i = 52; i > 0; i--) {
                var position = Math.floor(Math.random() * i);
                randomized_cards.push(_cards.splice(position, 1)[0]);
            }
        }
        , _create_html_card: function (string_card) {
            var card_template = $('#s-templates>.card').clone(true);
            var suit = string_card.charAt(0);
            var number = parseInt(string_card.substring(1));
            var html_card = card_template.clone(true);
            var card_html_img = html_card.children('img');
            card_html_img.attr('alt', suit + number);
            html_card.data('suit', suit);
            html_card.data('number', number);
            html_card.data('color', (suit === 'd' || suit === 'h') ? 'red' : 'black');
            return html_card;
        }
        , _deal_tableau: function () {
            for (var i = 0; i < 28; i++) {
                var string_random_card = randomized_cards.pop();
                var html_card = this.s('_create_html_card', string_random_card);
                //aaa
                if (i < 1) {
                    $('#s-tableau>.column.number1').append(html_card);
                }
                else {
                    if (i < 3) {
                        $('#s-tableau>.column.number2').append(html_card);
                    }
                    else {
                        if (i < 6) {
                            $('#s-tableau>.column.number3').append(html_card);
                        }
                        else {
                            if (i < 10) {
                                $('#s-tableau>.column.number4').append(html_card);
                            }
                            else {
                                if (i < 15) {
                                    $('#s-tableau>.column.number5').append(html_card);
                                }
                                else {
                                    if (i < 21) {
                                        $('#s-tableau>.column.number6').append(html_card);
                                    }
                                    else {
                                        $('#s-tableau>.column.number7').append(html_card);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        , _deal: function () {
            _this.s('_deal_tableau');
            _this.s('_sort_tableau_columns');
            _this.s('_prepare_front_tableau_cards');
            _this.s('_deal_stock');
            _this.s('_prepare_stock');
            _this.s('shuffle');
        }
        , shuffle: function () {
            //@todo animacion donde reparto, basicamente guardo el top y left de todas las cartas en tableau con data en cada carta, luego seteo el top y left de todas las cartas para que esten en el stock, y luego las animo una por una restrableciendolas a su lugar original (el que guarde en data) y ya :D
            var cards = $('#s-tableau .card');
            for (var i = 0; i < cards.length; i++) {
                var c = $(cards[i]);
                c.data('deal_top', c.css('top'));
                c.data('deal_left', c.css('left'));
            }
            var first_stock_card = $('#s-stock .card:first');;

            var z_index = 29;
            for (var i = 0; i < cards.length; i++) {
                var c = $(cards[i]);
                c.offset(first_stock_card.offset());
                c.css('z-index', z_index--);
            }
            setTimeout(function () {
                _this.s('c_r', cards);
            }, shuffle_animation_startup_time);
        }
        , c_r: function (cards) {
            var c = $(cards[number_of_tableau_cards]);
            c.animate({
                top: c.data('deal_top')
                ,left: c.data('deal_left')
            }, shuffle_animation_speed, function () {
                c.css('z-index', '2');


                c.css('z-index', '');

                number_of_tableau_cards++;
                if (number_of_tableau_cards === 28) {
                    shuffle_animation_ended = true;
                    return;
                }
                else
                    _this.s('c_r', cards);
            });
        }
        , _sort_tableau_columns: function () {
            _this = this;
            $('#s-tableau .column').each(function () {
                _this.s('_sort_tableau_column', $(this));
            });
        }
        , _sort_tableau_column: function (column) {
            column.find('.card').each(function () {
                var card = $(this);
                _this.s('_arrange_card', card);
            }
            );
        }
        , _arrange_card: function (top_card) {
            var next_card = top_card.next();
            if (!top_card.prev().size()) {//cuando se deja caer un rey en un espacio vacio
                top_card.css({top: '0px', left: '0px'});
            }
            if (next_card.size()) {
                var new_top = (parseFloat(top_card.css('top')) | 0) - 140;
                next_card.css('top', new_top);
                var new_left = (parseFloat(top_card.css('left')) | 0);
                next_card.css('left', new_left);
            }
        }
        , _get: function (variable_name) {
            return eval(variable_name);
        }
    };

    $.fn.s = function (method) {
        if (methods[method]) {
            return methods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            } else {
                $.error('Method ' + method + ' does not exist on jQuery.s');
            }
        }
    };

})(jQuery);