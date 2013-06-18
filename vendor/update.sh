#!/bin/sh

rm gtemplate-0.0.3.js
rm extends-0.0.2.js
rm jquery.min.js
wget https://raw.github.com/jimmynewtron/gtemplate/master/dist/gtemplate-0.0.3.js
wget https://raw.github.com/jimmynewtron/extends/master/dist/extends-0.0.2.js
wget http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js

echo "Done."
echo ""
