FROM nginx:stable

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/
COPY dist/ /usr/share/nginx/html/dist/
