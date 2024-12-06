echo "Switching to branch staging_production_v2"
git checkout staging_production_v2

echo "Building app.."
npm run build

echo "Deployingg files to server .."
scp -r build/* root@85.31.233.19:/var/www/85.31.233.19/


echo "DONE!"
