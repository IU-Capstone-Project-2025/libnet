# SSL Certificates

Place your SSL certificates in this directory:

- `fullchain.pem` - Full certificate chain
- `privkey.pem` - Private key

## For development (self-signed certificate):

```bash
# Generate self-signed certificate for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout privkey.pem \
  -out fullchain.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=libnet.site"
```

## For production:

Use Let's Encrypt or another CA to obtain valid certificates.
