FROM registry.access.redhat.com/ubi8/nodejs-18:latest

WORKDIR /opt/app-root/src

USER root

# Install build dependencies
RUN dnf install -y python3 make gcc-c++

# Set npm cache directory and configure npm to use it
ENV NPM_CONFIG_CACHE=/opt/app-root/src/.npm
RUN mkdir -p /opt/app-root/src/.npm && \
    chown -R 1001:0 /opt/app-root/src/.npm && \
    chmod 775 /opt/app-root/src/.npm

# Copy package files with correct permissions
COPY --chown=1001:0 package*.json ./

# Install dependencies as non-root user
USER 1001
RUN npm install

# Copy app source with correct permissions
COPY --chown=1001:0 . .

# Create data directories with correct permissions
USER root
RUN mkdir -p data/sites data/subpages data/uploads && \
    chown -R 1001:0 data && \
    chmod 755 data/sites data/subpages data/uploads

USER 1001

EXPOSE 5000

CMD ["npm", "start"]
