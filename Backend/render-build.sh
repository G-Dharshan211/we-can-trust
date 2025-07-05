npm install

if [[ ! -d $PUPPETEER_CACHE_DIR ]]; then
    echo "...Copying Puppeteer cache directory..."
    cp -R $XDG_CACHE_HOME/puppeteer/ $PUPPETEER_CACHE_DIR
else
    echo "...Storing Puppeteer Cache in Build Cache"
    cp -R $PUPPETEER_CACHE_DIR $XDG_CACHE_HOME
fi