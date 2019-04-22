# docker-webhook-node

## Usage
```
$ cp config.template.yml config.yml
$ openssl rand -hex 20 # For token
$ yarn && yarn start
```

URL: `http://domain:3000/:token`

### Configuration: `config.yml`
```
token: please-enter-secret-for-login

docker:
  organization1:
    - repository1:
        - tag1: |
            command1
            command2
        - tag2: systemctl restart docker-service
  organization2:
    - repository1:
        - tag1: command1
    - repository2:
        - tag1: |
            docker rm -f container
            docker pull organization2/repository2:tag1
            docker run --name container -p 8080:8080 organization2/repository2:tag1
```

## Todos
- [ ] Support regex for organization, repository and tag name [#1](https://github.com/micalgenus/docker-webhook-node/issues/1)
- [ ] Support HTTPS with [let's encrypt](https://letsencrypt.org/) certificate [#2](https://github.com/micalgenus/docker-webhook-node/issues/2)
- [ ] Test using travis-ci
- [ ] Wrapping docker image with dockerfile
