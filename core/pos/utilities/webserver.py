import os
import subprocess
import time

from jinja2 import Template

from config import settings


class WebServer:
    def __init__(self, company):
        self.company = company
        self.sudo_password = settings.env.str('SERVER_PASSWORD')

    def install_subdomain(self):
        template_name = """upstream server-{{ server_name }} {
    server unix:/tmp/gunicorn.sock fail_timeout=0;
}

server {
    listen 80;
    server_name {{ domain }};
    client_max_body_size 1000M;

    access_log {{ dir }}/logs/nginx-access.log;
    error_log {{ dir }}/logs/nginx-error.log;

    location /media/  {
        alias {{ dir }}/media/;
    }

    location /static/ {
        alias {{ dir }}/staticfiles/;
    }

    location /static/admin/ {
        alias {{ dir }}/staticfiles/admin/;
    }

    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $http_host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Proto https;
        proxy_redirect off;
        proxy_pass http://server-{{ server_name }};
        fastcgi_buffers 8 16k;
        fastcgi_buffer_size 32k;
        fastcgi_connect_timeout 600000s;
        fastcgi_send_timeout 600000s;
        fastcgi_read_timeout 600000s;
        proxy_read_timeout 600000s;
    }

    error_page 500 502 503 504 /templates/500.html;
}
"""
        template = Template(template_name)
        rendered_config = template.render(
            server_name=self.company.scheme.schema_name,
            dir=os.getcwd(),
            domain=f'{self.company.scheme.schema_name}.{settings.DOMAIN}',
        )
        nginx_config_path = f'{settings.BASE_DIR}/{self.company.scheme.schema_name}.conf'
        if os.path.exists(nginx_config_path):
            os.remove(nginx_config_path)
        with open(nginx_config_path, 'w') as f:
            f.write(rendered_config)
        commands = [
            {'command': 'Crear subdominio', 'args': f'echo {self.sudo_password} | sudo -S cp {nginx_config_path} /etc/nginx/sites-available/'},
            {'command': 'Habiliar subdominio', 'args': f'echo {self.sudo_password} | sudo -S ln -s /etc/nginx/sites-available/{self.company.scheme.schema_name}.conf /etc/nginx/sites-enabled/'},
            # {'name': 'Instalar SSL', 'command': f'echo -e "2\n" | echo {self.sudo_password} | sudo -S certbot --nginx -d {self.company.scheme.get_primary_domain()}'}
        ]
        result = []
        for command in commands:
            try:
                command['result'] = subprocess.run(command['args'], shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).returncode == 0
            except:
                command['result'] = False
            finally:
                del command['args']
                result.append(command)
        if os.path.exists(nginx_config_path):
            os.remove(nginx_config_path)
        response = {
            'result': result,
            'title': 'Ha ocurrido un error al instalar el subdominio'
        }
        if all(r['result'] for r in result):
            response['title'] = 'Subdominio instalado correctamente'
            self.company.installed = True
            self.company.edit()
        self.restart_nginx()
        return response

    def uninstall_subdomain(self):
        commands = [
            {'command': 'Desabilitar subdominio', 'args': f'echo {self.sudo_password} | sudo -S rm -r /etc/nginx/sites-enabled/{self.company.scheme.schema_name}.conf'},
            {'command': 'Eliminar subdominio', 'args': f'echo {self.sudo_password} | sudo -S rm -r /etc/nginx/sites-available/{self.company.scheme.schema_name}.conf'},
            # {'name': 'Desinstalando SSL', 'command': f'echo {self.sudo_password} | sudo -S sudo certbot delete --cert-name {self.company.scheme.get_primary_domain()}'}
        ]
        result = []
        for index, command in enumerate(commands, start=1):
            try:
                command['result'] = subprocess.run(command['args'], shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).returncode == 0
            except:
                command['result'] = False
            finally:
                del command['args']
                result.append(command)
        response = {
            'result': result,
            'title': 'Ha ocurrido un error al desinstalar el subdominio'
        }
        if all(r['result'] for r in result):
            response['title'] = 'Subdominio desinstalado correctamente'
            self.company.installed = False
            self.company.edit()
        self.restart_nginx()
        return response

    def restart_nginx(self):
        try:
            command = f'echo {self.sudo_password} | sudo -S systemctl restart nginx'
            process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            time.sleep(5)
            if process.poll() is None:
                print("El reinicio de Nginx se está ejecutando en segundo plano.")
            else:
                if process.returncode == 0:
                    print("El reinicio de Nginx se completó con éxito.")
                else:
                    print("Hubo un error al reiniciar Nginx.")
        except:
            pass