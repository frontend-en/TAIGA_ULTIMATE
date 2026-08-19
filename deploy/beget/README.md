# Deploy SigmaBots to Beget from GitLab

The pipeline verifies the project, builds a Next.js standalone server with
Node.js 20, synchronizes it to Beget over SSH, restarts Passenger, and checks
that the new Node.js process serves the current Git commit SHA.

## 1. One-time Beget setup

Create the site in Beget and attach `sigmabots.ru`. The commands below assume
the site directory is `$HOME/sigmabots.ru` and the application directory is
`$HOME/sigmabots.ru/app`.

Connect to the shared-hosting account and enter Beget's Docker environment:

```bash
ssh BEGET_ACCOUNT@BEGET_ACCOUNT.beget.tech
ssh localhost -p 222
```

The application requires Node.js 20. Passenger must use a Node binary that is
accessible from the web-server environment. Install a Node 20 build from
Beget's current guide into `$HOME/.local`, even if another `node` command is
already present. In Beget File Manager grant read and write access, including
nested directories, to `.local`. Confirm inside Docker:

```bash
command -v node
node --version
```

Exit Docker and configure Passenger in the normal Beget SSH session:

```bash
SITE_ROOT="$HOME/sigmabots.ru"
APP_ROOT="$SITE_ROOT/app"
NODE_BIN="$HOME/.local/bin/node"

mkdir -p "$APP_ROOT/tmp" "$SITE_ROOT/public_html"
test -x "$NODE_BIN"
printf '%s\n' \
  "PassengerNodejs $NODE_BIN" \
  "PassengerAppRoot $APP_ROOT" \
  'PassengerAppType node' \
  'PassengerStartupFile server.js' \
  > "$SITE_ROOT/.htaccess"
touch "$APP_ROOT/tmp/restart.txt"
```

Keep runtime secrets only on Beget. Create `$APP_ROOT/.env.production` with
permissions `600`:

```dotenv
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=mailer@example.com
SMTP_PASS=replace-with-a-real-secret
SMTP_FROM=SigmaBots <mailer@example.com>
LEAD_RECIPIENT=recipient@example.com
LEAD_TRUST_PROXY=false
```

The deploy script preserves `.env`, `.env.*`, and `tmp/`. Rsync uses delayed
updates, and the dynamic health check is the final deployment gate. The build
job also removes `.env*` from the standalone artifact before GitLab stores it.

## 2. Dedicated deploy key

Generate a dedicated key locally without a passphrase and append only its
public key to `$HOME/.ssh/authorized_keys` on Beget. Never commit either key.

Store the private key and verified Beget host keys as GitLab file variables.
Verify the host fingerprint outside CI before trusting it.

## 3. GitLab CI/CD variables

In **Settings > CI/CD > Variables**, add:

| Key | Type | Example/value | Protected |
| --- | --- | --- | --- |
| `SSH_PRIVATE_KEY` | File | Dedicated private key, ending with LF | Yes |
| `SSH_KNOWN_HOSTS` | File | Verified Beget known-hosts lines | Yes |
| `BEGET_SSH_HOST` | Variable | `BEGET_ACCOUNT.beget.tech` | Yes |
| `BEGET_SSH_USER` | Variable | Beget account login | Yes |
| `BEGET_SSH_PORT` | Variable | `22` | Yes |
| `BEGET_DEPLOY_PATH` | Variable | `/home/u/BEGET_ACCOUNT/sigmabots.ru/app` | Yes |

GitLab multiline SSH file variables must be **Visible**, not Masked. Protect
the default branch so protected variables are available to its pipeline.

`BEGET_DEPLOY_PATH` must be a canonical path shaped like
`/home/u/account/site/app`, inside the authenticated account's real `$HOME`,
and at least two directories below it. The deploy exits before `rsync --delete`
if any safety check fails.

The repository sets `BEGET_HEALTHCHECK_URL` to
`https://sigmabots.ru/api/health`. CI embeds the commit SHA in this uncached
Node.js route; after Passenger restarts, deployment succeeds only when the new
server process returns that SHA.

## 4. First deployment

Commit and push `.gitlab-ci.yml`, `next.config.ts`, `app/api/health/route.ts`,
and `deploy/beget/**` to the GitLab default branch. The jobs run in order:

1. `verify`
2. `build:standalone`
3. `deploy:production`

If deployment fails after upload, inspect Beget's web error log and verify
`PassengerNodejs`, `PassengerAppRoot`, `.local` shared access, and
`$APP_ROOT/.env.production`.

## Official references

- [Beget: Node.js and Passenger](https://beget.com/ru/kb/how-to/web-apps/node-js)
- [GitLab: SSH keys in CI/CD](https://docs.gitlab.com/ci/jobs/ssh_keys/)
- [Next.js: standalone output](https://nextjs.org/docs/15/app/api-reference/config/next-config-js/output)
