# buddycloud-angular-app

install

```
git clone git@github.com:buddycloud/buddycloud-angular-app.git
cd buddycloud-angular-app
chromium-browser index.html 
```

Configure webserver

```
server {
    listen 80;
    server_name buddycloud.org;
    rewrite ^ https://$server_name$request_uri? permanent;
}

server {
    listen                    443 ssl;
    server_name               buddycloud.org;
    ssl_certificate           /etc/certificates/buddycloud.org.complete.pem;
    ssl_certificate_key       /etc/certificates/buddycloud.org.complete.pem;
    ssl_dhparam               /etc/certificates/dh4096.pem;
    ssl_protocols             TLSv1.1 TLSv1.2;
    ssl_ciphers               'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:kEDH+AESGCM:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA:DHE-RSA-AES256-SHA:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!3DES:!MD5:!PSK';
    ssl_prefer_server_ciphers on;
    ssl_session_timeout       5m;
    ssl_session_cache         shared:SSL:5m;

    # HSTS (ngx_http_headers_module is required) (15768000 seconds = 6 months)
    add_header              Strict-Transport-Security max-age=15768000;

    # OCSP Stapling ---
    # fetch OCSP records from URL in ssl_certificate and cache them
    ssl_stapling              on;
    ssl_stapling_verify       on;

    root                      /opt/buddycloud.org;
    index                     index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:9123/;
    }

    location /primus/1/websocket {
        proxy_pass http://127.0.0.1:9123/primus/1/websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    try_files                 $uri $uri/ /index.html;
}
```

