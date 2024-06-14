var tblCompany;

var company = {
    list: function () {
        tblCompany = $('#data').DataTable({
            autoWidth: false,
            destroy: true,
            deferRender: true,
            ajax: {
                url: pathname,
                type: 'POST',
                headers: {
                    'X-CSRFToken': csrftoken
                },
                data: {
                    'action': 'search'
                },
                dataSrc: ""
            },
            columns: [
                {"data": "id"},
                {"data": "business_name"},
                {"data": "tradename"},
                {"data": "ruc"},
                {"data": "mobile"},
                {"data": "scheme"},
                {"data": "plan.full_name"},
                {"data": "id"},
            ],
            columnDefs: [
                {
                    targets: [-3],
                    class: 'text-center',
                    render: function (data, type, row) {
                        if (!$.isEmptyObject(row.scheme)) {
                            return row.scheme.name;
                        }
                        return '---';
                    }
                },
                {
                    targets: [-1],
                    class: 'text-center',
                    orderable: false,
                    render: function (data, type, row) {
                        var buttons = '<div class="btn-group" role="group">';
                        buttons += '<div class="btn-group" role="group">';
                        buttons += '<button type="button" class="btn btn-secondary btn-sm dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i class="fas fa-list"></i> Opciones</button>';
                        buttons += '<div class="dropdown-menu dropdown-menu-right">';
                        buttons += '<a class="dropdown-item" href="' + pathname + 'update/' + row.id + '/"><i class="fas fa-edit"></i> Editar</a>';
                        buttons += '<a class="dropdown-item" href="' + pathname + 'delete/' + row.id + '/"><i class="fas fa-trash-alt"></i> Eliminar</a>';
                        if (!row.installed) {
                            buttons += '<a class="dropdown-item" rel="install_subdomain"><i class="fas fa-folder-plus"></i> Instalar subdominio</a>';
                        } else {
                            buttons += '<a class="dropdown-item" rel="uninstall_subdomain"><i class="fas fa-folder-minus"></i> Desinstalar subdominio</a>';
                        }
                        buttons += '</div></div></div>';
                        return buttons;
                    }
                },
            ],
            initComplete: function (settings, json) {
                $('[data-toggle="tooltip"]').tooltip();
                // $(this).wrap('<div class="dataTables_scroll"><div/>');
            }
        });
    }
};

$(function () {
    company.list();

    $('#data tbody')
        .off()
        .on('click', 'a[rel="install_subdomain"]', function () {
            $('.tooltip').remove();
            var tr = tblCompany.cell($(this).closest('td, li')).index();
            var row = tblCompany.row(tr.row).data();
            var params = new FormData();
            params.append('action', 'install_subdomain');
            params.append('id', row.id);
            var args = {
                'params': params,
                'content': '¿Estas seguro de instalar el subdominio?',
                'success': function (request) {
                    $('#title').html(request.title);
                    $('#result').html(JSON.stringify(request.result));
                    $('#myModalResult').modal('show');
                }
            };
            submit_with_formdata(args);
        })
        .on('click', 'a[rel="uninstall_subdomain"]', function () {
            $('.tooltip').remove();
            var tr = tblCompany.cell($(this).closest('td, li')).index();
            var row = tblCompany.row(tr.row).data();
            var params = new FormData();
            params.append('action', 'uninstall_subdomain');
            params.append('id', row.id);
            var args = {
                'params': params,
                'content': '¿Estas seguro de desinstalar el subdominio?',
                'success': function (request) {
                    $('#title').html(request.title);
                    $('#result').html(JSON.stringify(request.result));
                    $('#myModalResult').modal('show');
                }
            };
            submit_with_formdata(args);
        });

    $('#myModalResult').on('hidden.bs.modal', function (event) {
        company.list();
    });
});