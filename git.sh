#! /usr/bin/bash 
# install git client
apt-get install git
ssh-keygen -t rsa -C "1027021405@qq.com"
# copy /root/.ssh/id_ras.pub to github  account >> ssh keys
#test
ssh -T git@github.com
#
git config --global user.name ""
git config --global user.email ""

git remote add "your local gitName" git@github.com:yeziwen/pythonJOB.git

# pull first ,then push

git pull localgitName master

git add localfile
git commit -m ""
git push localgitName master

