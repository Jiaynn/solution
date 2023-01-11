FROM aslan-spock-register.qiniu.io/spock-resources/portalv4-nginx

ADD /dist /portalv4/dist

ADD /portalv4-spock-nginx-certificate.conf /etc/nginx/sites-available/default

ADD /frontend.sh ./

ENV APP=certificate

EXPOSE 80

ENTRYPOINT ["./frontend.sh"]
