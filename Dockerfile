FROM node:23-alpine as keycloakify_jar_builder

RUN apk --no-cache add git maven
RUN git clone https://github.com/keycloakify/keycloakify-starter.git
RUN mkdir -p /opt/app \
    && cp ./keycloakify-starter/package.json /opt/app/ \
    && cp ./keycloakify-starter/yarn.lock /opt/app/ 

WORKDIR /opt/app
RUN yarn install --frozen-lockfile
RUN cp -r /keycloakify-starter/* /opt/app
RUN yarn build-keycloak-theme

FROM quay.io/keycloak/keycloak:26.1.0 as builder
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_DB=postgres

WORKDIR /opt/keycloak

COPY --from=keycloakify_jar_builder /opt/app/dist_keycloak/*.jar /opt/keycloak/providers/
RUN keytool -genkeypair -storepass password -storetype PKCS12 -keyalg RSA -keysize 2048 \
    -dname "CN=server" -alias server -ext "SAN:c=DNS:localhost,IP:127.0.0.1" \
    -keystore conf/server.keystore

ADD --chown=keycloak:keycloak https://repo1.maven.org/maven2/io/phasetwo/keycloak/keycloak-magic-link/0.33/keycloak-magic-link-0.33.jar /opt/keycloak/providers/keycloak-magic-link-0.33.jar
ADD --chown=keycloak:keycloak https://repo1.maven.org/maven2/io/phasetwo/keycloak/keycloak-events/0.39/keycloak-events-0.39.jar /opt/keycloak/providers/keycloak-events-0.39.jar
RUN /opt/keycloak/bin/kc.sh build

FROM quay.io/keycloak/keycloak:26.1.0
COPY --from=builder /opt/keycloak/ /opt/keycloak/

USER 1000
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--hostname-strict=false"]