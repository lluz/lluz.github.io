/*!
 * jQuery Field Compare String
 * Description: jQuery plugin to compare the value of an input[type=text] or textarea to the string of text contained by an html element.
 *
 * Copyright (c) 2017 Luis Luz - UXD Lda
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   https://github.com/lluz/jquery-field-compare-string
 *
 * Version:  1.0.2
 *
 */

(function($, window, document, undefined) {

    $.fn.jFieldCompareString = function(options) {
        if ( this === undefined || this.length === 0 || this.length > 1 ) {
            console.log('jquery.jFieldCompareString() INITIALIZATION ERROR: This is a 1:1 plugin initialization. You need to select only one input/textarea and declare the reference text element with the options property "compare_to". See documentation form more information.');
            return false;
        }

        var $field = this.eq(0);
        var $fieldParent = $field.closest('.jfcs-field');
        var $fieldRoot = $field.closest('.jfcs-wrapper');
        var $reference = $fieldRoot.find('.jfcs-reference').eq(0);
        var settings = {
            compare_to: $reference,
            field_protection: false,
            msg_notok: 'Your transcript has an error, please correct.',
            msg_incomplete: 'Your transcript is incomplete, please correct.',
            msg_ok: 'Your transcript is correct.'
        };
        var fieldProtectionTimer;
        var validationMsgTextNOTOK = settings.msg_notok;
        var validationMsgTextINCOMPLETE = settings.msg_incomplete;
        var validationMsgTextOK = settings.msg_ok;

        function stringBeginsWith(refStr, valueStr){
            return( refStr.indexOf(valueStr) === 0 );
        }
        function stringClean(str){
            var textString = $.trim(str);
            textString = textString.replace(/[\t\n]+/g, ' ').replace(/ +(?= )/g, '').replace(/[´`~^¨<>«»]/g, '');
            return textString;
        }
        function fieldDragProtectionAdd(){
            var target = $('.jfcs-field-protection');
            clearTimeout( fieldProtectionTimer );
            target.addClass('jfcs-protecting');
        }
        function fieldDragProtectionRemove(){
            var target = $('.jfcs-field-protection');
            fieldProtectionTimer = setTimeout(function(){
                target.removeClass('jfcs-protecting');
            }, 100);
        }
        function fieldCompareCheck(fieldID, originalText, incomplete){
            var inputElm = $('#' + fieldID);
            var inputVal = inputElm.val();
            var inputValClean = stringClean( inputVal );
            var inputRoot = inputElm.closest('.jfcs-wrapper');
            var inputParent = inputElm.parent('.jfcs-field');
            var validationMsgs = inputRoot.find('.jfcs-validation');
            var validationMsgElmError = validationMsgs.find('.jfcs-validation-msg-notok');
            var validationMsgElmIncomplete = validationMsgs.find('.jfcs-validation-msg-incomplete');
            var validationMsgElmSuccess = validationMsgs.find('.jfcs-validation-msg-ok');
            var inputParentValidationClsError = 'jfcs-field-validation-error';
            var inputParentValidationClsSuccess = 'jfcs-field-validation-success';
            if ( incomplete ) {
                validationMsgElmError.hide();
                validationMsgElmIncomplete.fadeIn();
                validationMsgElmSuccess.hide();
                inputParent.addClass(inputParentValidationClsError).removeClass(inputParentValidationClsSuccess);
            }
            else if ( inputValClean === originalText ) {
                validationMsgElmError.hide();
                validationMsgElmIncomplete.hide();
                validationMsgElmSuccess.fadeIn();
                inputParent.removeClass(inputParentValidationClsError).addClass(inputParentValidationClsSuccess);
            }
            else {
                if ( inputValClean.length ) {
                    if ( originalText.search(inputValClean) !== -1 && stringBeginsWith(originalText, inputValClean) ) {
                        validationMsgElmError.hide();
                        validationMsgElmIncomplete.hide();
                        validationMsgElmSuccess.hide();
                        inputParent.removeClass( inputParentValidationClsError + ' ' + inputParentValidationClsSuccess );
                    }
                    else {
                        validationMsgElmError.fadeIn();
                        validationMsgElmIncomplete.hide();
                        validationMsgElmSuccess.hide();
                        inputParent.addClass(inputParentValidationClsError).removeClass(inputParentValidationClsSuccess);
                    }
                }
                else {
                    validationMsgElmError.hide();
                    validationMsgElmIncomplete.hide();
                    validationMsgElmSuccess.hide();
                    inputParent.removeClass( inputParentValidationClsError + ' ' + inputParentValidationClsSuccess );
                }
            }
        }

        if (options) {

            if ( options.msg_notok !== undefined && $.trim( options.msg_notok ) !== '' ) {
                validationMsgTextNOTOK = options.msg_notok;
            }
            if ( options.msg_incomplete !== undefined && $.trim( options.msg_incomplete ) !== '' ) {
                validationMsgTextINCOMPLETE = options.msg_incomplete;
            }
            if ( options.msg_ok !== undefined && $.trim( options.msg_ok ) !== '' ) {
                validationMsgTextOK = options.msg_ok;
            }
            
            if ( options.compare_to === undefined ) {
                $reference = settings.compare_to;
            }
            else {
                var compareElement = $(options.compare_to);
                if ( !compareElement.length ) {
                    console.log('jquery.jFieldCompareString() INITIALIZATION ERROR: You need to declare the reference text element with the options property "compare_to". See documentation form more information.');
                    return false;
                }
                else {
                    $reference = compareElement;
                }
            }

            if ( options.field_protection !== undefined && options.field_protection ) {
                
                $field
                .on('contextmenu', function(){
                    return false;
                })
                .on('keydown', function(e){
                    if ( e.which === 220 || e.which === 226 || e.which === 221 ) {
                        e.preventDefault();
                    }
                })
                .bind('cut copy paste', function (e) {
                    e.preventDefault();
                });

                $fieldParent
                .addClass('jfcs-field-protection')
                .on('dragover', fieldDragProtectionAdd)
                .on('dragleave', fieldDragProtectionRemove);

            }

            $.extend(settings, options);
        }

        $fieldRoot.append(
            '<div class="jfcs-validation">' +
                '<div class="jfcs-validation-msg jfcs-validation-msg-error jfcs-validation-msg-notok">' + validationMsgTextNOTOK + '</div>' +
                '<div class="jfcs-validation-msg jfcs-validation-msg-error jfcs-validation-msg-incomplete">' + validationMsgTextINCOMPLETE + '</div>' +
                '<div class="jfcs-validation-msg jfcs-validation-msg-success jfcs-validation-msg-ok">' + validationMsgTextOK + '</div>' +
            '</div>'
        );
        
        $field
        .on('keyup', function(){
            var fieldInputID = $(this).attr('id');
            var fieldRefTextElm = $reference;
            var fieldRefTextString = stringClean( fieldRefTextElm.text() );
            fieldCompareCheck(fieldInputID, fieldRefTextString);
        })
        .on('focus', function(){
            var fieldInputID = $(this).attr('id');
            var fieldRefTextElm = $reference;
            var fieldRefTextString = stringClean( fieldRefTextElm.text() );
            fieldCompareCheck(fieldInputID, fieldRefTextString);
        })
        .on('blur', function(){
            var fieldInputID = $(this).attr('id');
            var fieldInputVal = $(this).val();
            var fieldInputValClean = stringClean( fieldInputVal );
            var fieldRefTextElm = $reference;
            var fieldRefTextString = stringClean( fieldRefTextElm.text() );
            $(this).val( $.trim( fieldInputVal.replace(/ +(?= )/g, '').replace(/[<>«»]/g, '').replace(/(?:(?:\r\n|\r|\n)\s*){2}/gm, '') ) );
            fieldDragProtectionRemove();
            if ( fieldRefTextString.search(fieldInputValClean) !== -1 && stringBeginsWith(fieldRefTextString, fieldInputValClean) && fieldInputValClean !== fieldRefTextString ) {
                fieldCompareCheck(fieldInputID, '', true);
            }
            else {
                fieldCompareCheck(fieldInputID, fieldRefTextString);
            }
        });

    };

})(jQuery, window, document);