var auth = {};

auth.sendCode = function (form) {
    if (!$('input', form).val().length) {
        $('input', form).focus();
        return false;
    }
    $('#login-send').html(locale.login_sending_code);
    $.post('/api/auth/sendCode', $(form).serialize(), function (data) {
        if (data.error) {
            $('#login-send').html(locale.login_send_code);
            swal({
                title: locale.modal_error,
                text: locale.modal_error_incorrect_username,
                type: 'error'
            });
        } else if (data.response == 'SEND_OK') {
            $('#login-send').html(locale.login_check_code);
            if ($('#login-send-code-text').size()) {
                $('#login-send-code-text').html(locale.login_send_code_text);
                $('#send_code').hide();
                $('#check_code').show().find('input').focus();
            } else {
                $.magnificPopup.open({
                    items: {
                        src: '#check-code'
                    },
                    type: 'inline',
                    preloader: false,
                    focus: '#input-code',

                    callbacks: {
                        beforeOpen: function () {
                            if ($(window).width() < 700) {
                                this.st.focus = false;
                            } else {
                                this.st.focus = '#input-code';
                            }
                        },
                        beforeClose: function () {
                            $('.not-sent-code').show();
                            $('.come').show();
                            $('.text-problem').hide();
                            $('.incorrect-code').hide();
                        }
                    }
                });
            }
        } else if (data.response == 'NOT_REGISTER_USER') {
            $.post('/api/auth/checkCode', function (data) {
                if ('register' in data.response && 'yaCounter29034495' in window) {
                    f('reg');
                    yaCounter29034495.reachGoal('register');
                }
                setTimeout(function () {
                    f('reg1');
                    window.location.href = window['ref_id'] ? '/id' + window['ref_id'] : '/reg';
                }, 300);
            });
        }
    });
    return false;
};

auth.checkCodeSending = false;
auth.checkCode = function (form) {
    if (auth.checkCodeSending) {
        return false;
    }
    auth.checkCodeSending = true;
    if (!$('input', form).val().length) {
        $('input', form).focus();
        return false;
    }
    $('#login-send').html(locale.login_checking_code);
    $.post('/api/auth/checkCode', $(form).serialize(), function (data) {
        f(data);
        if (data.error) {
            auth.checkCodeSending = false;
            if ($('#login-send-code-text').size()) {
                $('#login-send').html(locale.login_check_code);
                $('#input-code').val('');
                swal({
                    title: locale.modal_error,
                    text: locale.modal_error_incorrect_code,
                    type: 'error'
                });
            } else {
                $('.not-sent-code').hide();
                $('.incorrect-code').show();
                $('#input-code').val('');
            }
        } else {
            if (data.response.register && 'yaCounter29034495' in window) {
                f('reg');
                 yaCounter29034495.reachGoal('register');
            }
            setTimeout(function () {
                f('reg1');
                window.location.href = window['ref_id'] ? '/id' + window['ref_id'] : '/reg';
            }, 300);
        }
    });
    return false;
};

auth.reLogin = function () {
    $.magnificPopup.close();
    $('.not-sent-code').show();
    $('.come').show();
    $('.text-problem').hide();
    $('.incorrect-code').hide();
    $('#send_code form').trigger('submit');
};

auth.saving = false;
auth.save = function (form, uid) {
    if (auth.saving) {
        return false;
    }

    auth.saving = true;
    $('.sing-up-save').html(locale.sign_up_saving);

    $.post('/api/users/editProfile', $(form).serialize(), function (data) {
        auth.saving = false;
        if (data.error) {
            $('.sing-up-save').html(locale.sign_up_save);
            swal({
                title: locale.modal_error_save_sing_up,
                text: locale.modal_error_save_sing_up_text,
                type: 'error'
            });
        } else {
            window.location.href = '/id' + uid;
        }
    });

    return false;
};


var users = {};
users.removePhotoIcon = function () {

};

$(function () {
    $('#fileupload').bind('fileuploadstart', function (e) {
        $('.mbtn span').html(locale.reg_uploading_photo).parent().attr('disabled', true);
    }).fileupload({
        url: '/api/users/addPhoto',
        dataType: 'json',
        done: function (e, data) {
            $('.mbtn span').attr('disabled', '').html(locale.reg_upload_photo).parent().attr('disabled', false);

            if (data.result.error) {
                swal({
                    title: locale.modal_error_upload_photo,
                    text: locale['modal_error_upload_photo_' + data.error.msg.toLowerCase()],
                    type: 'error'
                });
            } else {
                var str = '<img src="' + data.result.response.preview + '" id="photo-' + data.result.response._id + '" /><span class="icon icon-remove"></span>';
                if ($('.photos .general i').size()) {
                    $('.photos .general').html(str);
                } else {
                    if ($('.photos .other i').size()) {
                        $('.photos .other i:first').parent().html(str);
                    } else {
                        $('.photos .other img:last').parent().html(str);
                    }
                }
            }
        },
        fail: function () {
            swal({
                title: locale.modal_error_upload_photo,
                text: locale.modal_error_upload_file,
                type: 'error'
            });
        }
    });

    $(document).on('click', '.photos .other div img', function () {
        var ownSrc = $('.photos .general img').attr('src');
        var ownId = $('.photos .general img').attr('id');
        var _t = $(this);
        $.post('/api/users/primaryPhoto', {
            pid: _t.attr('id').split('-')[1]
        }, function (data) {
            $('.photos .general img').attr('src', _t.attr('src'));
            $('.photos .general img').attr('id', _t.attr('id'));
            _t.attr('src', ownSrc);
            _t.attr('id', ownId);
        });
    });

    $(document).on('click', '.photos span.icon-remove', function () {
        var _t = $(this);
        var strSmall = '<i class="icon icon-camera icon-camera-small"></i>';
        var strLarge = '<i class="icon icon-camera icon-camera-large"></i>';
        $.post('/api/users/deletePhoto', {
            pid: _t.prev().attr('id').split('-')[1]
        }, function (data) {
            if (_t.parent().hasClass('general')) {
                if ($('.photos .other img').size()) {
                    _t.parent().html($('.photos .other img:last').parent().html());
                    $('.photos .other img:last').parent().html(strSmall);
                } else {
                    _t.parent().html(strLarge);
                }
            } else {
                _t.parent().html(strSmall);
            }
        });
    });


    $('.user-info').each(function () {
        $(this).find('.photos a').magnificPopup({
            type: 'image',
            tLoading: 'Loading image #%curr%...',
            mainClass: 'mfp-img-mobile',
            index: 1,
            gallery: {
                enabled: true,
                navigateByImgClick: true,
                preload: [0, 1, 2]
            }
        });
    });

    $('.photo, .photos-profile').magnificPopup({
        delegate: 'a',
        type: 'image',
        tLoading: 'Loading image #%curr%...',
        mainClass: 'mfp-img-mobile',
        index: 1,
        gallery: {
            enabled: true,
            navigateByImgClick: true,
            preload: [0, 1, 2]
        }
    });

    $('.input-focus').focus();
});

setTimeout(function () {
    var username = location.search.split('username=');
    if (username[1]) {
        $('#send_code input').val(username[1]);
        $('#send_code button').trigger('submit');
    }
}, 500);


users.hideSearch = function (check) {
    $.post('/api/users/hideSearch', {hide: !check ? 1 : 0});
};

users.saving = false;
users.game = function (form) {
    if ($('textarea', form).size() && !$('textarea', form).val().length) {
        $('textarea', form).focus();
        return false;
    }

    if (users.saving) {
        return false;
    }

    users.saving = true;
    $('.game-saving').html(locale.game_saving);

    var error = {
        SEX_ERROR: 'modal_error_game_sex',
        AGE_ERROR: 'modal_error_game_age',
        COUNTRY_ERROR: 'modal_error_game_country'
    };
    $.post('/api/users/changeProfile', $(form).serialize(), function (data) {
        users.saving = false;
        $('.game-saving').html(locale.game_save);

        if (data.response) {
            $(form).remove();
            $('.game:first').show();
        } else if (data.error) {
            swal({
                title: locale.modal_error_save_game,
                text: locale[error[data.error.msg]],
                type: 'error',
                timer: 2500
            });
        }
    });
    return false;
};


$('a.js-click').on('click', function (event) {
    event.preventDefault();
    var self = this;
    if ('yaCounter29034495' in window) {
        yaCounter29034495.reachGoal('click');
    }
    $.post('/api/users/click', {username: this.href.split('.me/')[1]}, function (data) {
        window.open(self.href);
    });
});