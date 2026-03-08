# ─── Build Stage ─────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && npm install; \
    fi

COPY . .

# Build the Next.js static export (outputs to /app/out)
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


# ─── Production NGINX Server ─────────────
FROM nginx:alpine AS runner

# Copy the static export from builder to nginx html folder
COPY --from=builder /app/out /usr/share/nginx/html

# Expose port 3000
EXPOSE 3000

# Overwrite default nginx config to listen on 3000 and handle Next.js client routing
RUN echo "server { \
    listen 3000; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files \$uri \$uri/ /index.html; \
    } \
    }" > /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
