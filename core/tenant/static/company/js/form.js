var fv;
var input_electronic_signature;

var company = {
    loadCertificate: function () {
        var params = new FormData();
        params.append('action', 'load_certificate');
        params.append('certificate', input_electronic_signature[0].files[0]);
        params.append('electronic_signature_key', $('input[name="electronic_signature_key"]').val());
        $.ajax({
            url: pathname,
            data: params,
            type: 'POST',
            headers: {
                'X-CSRFToken': csrftoken
            },
            dataType: 'json',
            processData: false,
            contentType: false,
            success: function (request) {
                if (!request.hasOwnProperty('error')) {
                    var content = '<p>';
                    $.each(request, function (name, value) {
                        content += '<b>' + name + ':</b><br>' + value + '<br>';
                    });
                    content += '</p>';
                    $('#content-certificate').html(content);
                    $('#myModalCertificate').modal('show');
                    return false;
                }
                message_error(request.error);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                message_error(errorThrown + ' ' + textStatus);
            }
        });
    },
    validateExtensionP12: function (input) {
        var extension = input.value.split('.').pop().toLowerCase();
        return $.inArray(extension, ['p12']) === -1;
    }
};

document.addEventListener('DOMContentLoaded', function (e) {
    fv = FormValidation.formValidation(document.getElementById('frmForm'), {
            locale: 'es_ES',
            localization: FormValidation.locales.es_ES,
            plugins: {
                trigger: new FormValidation.plugins.Trigger(),
                submitButton: new FormValidation.plugins.SubmitButton(),
                bootstrap: new FormValidation.plugins.Bootstrap(),
                icon: new FormValidation.plugins.Icon({
                    valid: 'fa fa-check',
                    invalid: 'fa fa-times',
                    validating: 'fa fa-refresh',
                }),
            },
            fields: {
                ruc: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 13,
                        },
                        digits: {},
                    }
                },
                business_name: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                    }
                },
                tradename: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                    }
                },
                main_address: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                    }
                },
                establishment_address: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                    }
                },
                establishment_code: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 3,
                        },
                        digits: {},
                    }
                },
                issuing_point_code: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 3,
                        },
                        digits: {},
                    }
                },
                special_taxpayer: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 3,
                        },
                        digits: {},
                    }
                },
                obligated_accounting: {
                    validators: {
                        notEmpty: {},
                    }
                },
                image: {
                    validators: {
                        file: {
                            extension: 'jpeg,jpg,png',
                            type: 'image/jpeg,image/png',
                            maxFiles: 1,
                            message: 'Introduce una imagen válida'
                        }
                    }
                },
                environment_type: {
                    validators: {
                        notEmpty: {
                            message: 'Seleccione un tipo de ambiente de facturación'
                        },
                    }
                },
                emission_type: {
                    validators: {
                        notEmpty: {
                            message: 'Seleccione un tipo de ambiente de facturación'
                        },
                    }
                },
                mobile: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 10,
                        },
                        digits: {},
                    }
                },
                phone: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 7,
                        },
                        digits: {},
                    }
                },
                email: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 5
                        },
                        regexp: {
                            regexp: /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/i,
                            message: 'El formato email no es correcto'
                        }
                    }
                },
                website: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                    }
                },
                description: {
                    validators: {
                        notEmpty: {},
                        stringLength: {
                            min: 2,
                        },
                    }
                },
                iva: {
                    validators: {
                        numeric: {
                            message: 'El valor no es un número',
                            thousandsSeparator: '',
                            decimalSeparator: '.'
                        }
                    }
                },
                vat_percentage: {
                    validators: {
                        notEmpty: {
                            message: 'Seleccione una categoría'
                        },
                    }
                },
                electronic_signature: {
                    validators: {
                        notEmpty: {},
                        callback: {
                            message: 'Introduce un archivo con extensión .p12',
                            callback: function (input) {
                                return !company.validateExtensionP12(input);
                            }
                        },
                    }
                },
                electronic_signature_key: {
                    validators: {
                        notEmpty: {},
                    }
                },
                email_host: {
                    validators: {
                        notEmpty: {},
                    }
                },
                email_port: {
                    validators: {
                        digits: {},
                        notEmpty: {},
                    }
                },
                email_host_user: {
                    validators: {
                        notEmpty: {},
                    }
                },
                email_host_password: {
                    validators: {
                        notEmpty: {},
                    }
                },
                schema_name: {
                    validators: {
                        notEmpty: {},
                    }
                },
                plan: {
                    validators: {
                        notEmpty: {
                            message: 'Seleccione un plan'
                        },
                    }
                },
            },
        }
    )
        .on('core.element.validated', function (e) {
            if (e.valid) {
                const groupEle = FormValidation.utils.closest(e.element, '.form-group');
                if (groupEle) {
                    FormValidation.utils.classSet(groupEle, {
                        'has-success': false,
                    });
                }
                FormValidation.utils.classSet(e.element, {
                    'is-valid': false,
                });
            }
            const iconPlugin = fv.getPlugin('icon');
            const iconElement = iconPlugin && iconPlugin.icons.has(e.element) ? iconPlugin.icons.get(e.element) : null;
            iconElement && (iconElement.style.display = 'none');
        })
        .on('core.validator.validated', function (e) {
            if (!e.result.valid) {
                const messages = [].slice.call(fv.form.querySelectorAll('[data-field="' + e.field + '"][data-validator]'));
                messages.forEach((messageEle) => {
                    const validator = messageEle.getAttribute('data-validator');
                    messageEle.style.display = validator === e.validator ? 'block' : 'none';
                });
            }
        })
        .on('core.form.valid', function () {
            var args = {
                'params': new FormData(fv.form),
                'form': fv.form
            };
            submit_with_formdata(args);
        });
});

$(function () {

    input_electronic_signature = $('input[name="electronic_signature"]');

    $('.select2').select2({
        theme: 'bootstrap4',
        language: "es"
    });

    $('select[name="plan"]').on('change', function () {
        fv.revalidateField('plan');
    });

    $('input[name="ruc"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });

    $('input[name="establishment_code"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });

    $('input[name="issuing_point_code"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });

    $('input[name="special_taxpayer"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });

    $('input[name="mobile"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });

    $('input[name="email_port"]').on('keypress', function (e) {
        return validate_text_box({'event': e, 'type': 'numbers'});
    });

    $('input[name="iva"]')
        .TouchSpin({
            min: 0.01,
            max: 1000000,
            step: 0.01,
            decimals: 2,
            boostat: 5,
            maxboostedstep: 10,
            prefix: '%'
        })
        .on('change touchspin.on.min touchspin.on.max', function () {
            fv.revalidateField('iva');
        })
        .on('keypress', function (e) {
            return validate_text_box({'event': e, 'type': 'decimals'});
        });

    $('i[data-field="iva"]').hide();

    input_electronic_signature.on('change', function () {
        var status = company.validateExtensionP12(this);
        $('.btnLoadCertificate').prop('disabled', status);
    });

    if ($('input[name="electronic_signature-clear"]').length) {
        fv.disableValidator('electronic_signature');
        $('.btnLoadCertificate').prop('disabled', false);
    }

    $('.btnLoadCertificate').on('click', function () {
        company.loadCertificate();
    });

    // insert info
    // $(fv.form).find('input[name="business_name"]').val('VELEZ AGUIRRE SIMON EDUARDO');
    // $(fv.form).find('input[name="tradename"]').val('PUNTOHELP');
    // $(fv.form).find('input[name="ruc"]').val('0921637781001');
    // $(fv.form).find('input[name="establishment_code"]').val('003');
    // $(fv.form).find('input[name="issuing_point_code"]').val('003');
    // $(fv.form).find('input[name="special_taxpayer"]').val('000');
    // $(fv.form).find('input[name="main_address"]').val('5 DE OCTUBRE Y 10 DE AGOSTO NARANJITO,GUAYAS');
    // $(fv.form).find('input[name="establishment_address"]').val('5 DE OCTUBRE Y 10 DE AGOSTO NARANJITO,GUAYAS');
    // $(fv.form).find('input[name="mobile"]').val('0996555528');
    // $(fv.form).find('input[name="phone"]').val('2977557');
    // $(fv.form).find('input[name="email"]').val('puntohelpsa@gmail.com');
    // $(fv.form).find('input[name="website"]').val('https://puntohelp.com');
    // $(fv.form).find('input[name="description"]').val('https://puntohelp.com');
    // $(fv.form).find('input[name="iva"]').val('12.00');
    // $(fv.form).find('input[name="electronic_signature_key"]').val('224426rajansn');
    // $(fv.form).find('input[name="email_host_user"]').val('factorapos19@gmail.com');
    // $(fv.form).find('input[name="email_host_password"]').val('nbkqthnfkysfuudn');
});