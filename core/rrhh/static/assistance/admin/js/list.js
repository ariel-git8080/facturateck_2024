var input_date_range;
var tblAssistance;
var current_date;
var assistance = {
    list: function () {
        var parameters = {
            'action': 'search',
            'start_date': input_date_range.data('daterangepicker').startDate.format('YYYY-MM-DD'),
            'end_date': input_date_range.data('daterangepicker').endDate.format('YYYY-MM-DD'),
        };
        tblAssistance = $('#tblAssistance').DataTable({
            autoWidth: false,
            destroy: true,
            ajax: {
                url: pathname,
                type: 'POST',
                data: parameters,
                dataSrc: "",
                headers: {
                    'X-CSRFToken': csrftoken
                }
            },
            columns: [
                {data: "assistance.date_joined"},
                {data: "employee.user.names"},
                {data: "employee.dni"},
                {data: "employee.position.name"},
                {data: "employee.area.name"},
                {data: "description"},
                {data: "state"},
            ],
            columnDefs: [
                {
                    targets: [0],
                    class: 'text-center',
                    render: function (data, type, row) {
                        return data;
                    }
                },
                {
                    targets: [-2],
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (!$.isEmptyObject(row.description)) {
                            return row.description;
                        }
                        return 'Sin detalles';
                    }
                },
                {
                    targets: [-1],
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (row.state) {
                            return '<span class="badge badge-success badge-pill">Si</span>';
                        }
                        return '<span class="badge badge-danger badge-pill">No</span>';
                    }
                },
            ],
            initComplete: function (settings, json) {
                $(this).wrap('<div class="dataTables_scroll"><div/>');
            }
        });
    }
};

$(function () {

    current_date = moment().format("YYYY_MM_DD");
    input_date_range = $('input[name="date_range"]');

    input_date_range
        .daterangepicker({
            language: 'auto',
            startDate: new Date(),
            locale: {
                format: 'YYYY-MM-DD',
            }
        });

    $('.drp-buttons').hide();

    $('.btnSearchAssistances').on('click', function () {
        assistance.list();
    });

    $('.btnRemoveAssistances').on('click', function () {
        var start_date = input_date_range.data('daterangepicker').startDate.format('YYYY-MM-DD');
        var end_date = input_date_range.data('daterangepicker').endDate.format('YYYY-MM-DD');
        location.href = pathname + 'delete/' + start_date + '/' + end_date + '/';
    });

    $('.btnUpdateAssistance').on('click', function () {
        var start_date = input_date_range.data('daterangepicker').startDate.format('YYYY-MM-DD');
        var end_date = input_date_range.data('daterangepicker').endDate.format('YYYY-MM-DD');
        if (start_date !== end_date) {
            message_error('Para editar una asistencia se debe hacer de un dia en especifico no en rango');
            return false;
        }
        location.href = pathname + 'update/' + start_date + '/';
    });

    $('.btnExportAssistancesExcel').on('click', function () {
        $.ajax({
            url: pathname,
            data: {
                'start_date': input_date_range.data('daterangepicker').startDate.format('YYYY-MM-DD'),
                'end_date': input_date_range.data('daterangepicker').endDate.format('YYYY-MM-DD'),
                'action': 'export_assistences_excel'
            },
            type: 'POST',
            xhrFields: {
                responseType: 'blob'
            },
            headers: {
                'X-CSRFToken': csrftoken
            },
            beforeSend: function () {
                loading({'text': '...'});
            },
            success: function (request) {
                if (!request.hasOwnProperty('error')) {
                    var a = document.createElement("a");
                    document.body.appendChild(a);
                    a.style = "display: none";
                    const blob = new Blob([request], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
                    const url = URL.createObjectURL(blob);
                    a.href = url;
                    a.download = "download_excel_" + current_date + ".xlsx";
                    a.click();
                    window.URL.revokeObjectURL(url);
                    return false;
                }
                message_error(request.error);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                message_error(errorThrown + ' ' + textStatus);
            },
            complete: function () {
                $.LoadingOverlay("hide");
            }
        });
    });
});