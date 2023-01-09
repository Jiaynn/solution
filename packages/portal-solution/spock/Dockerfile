FROM aslan-spock-register.qiniu.io/spock-resources/portalv4-nginx

ADD /dist /portalv4/dist

ADD /cmd.sh ./

EXPOSE 80

ENTRYPOINT ["./cmd.sh"]
