Initialise by command 
npm init
type module for import syntax in package.json
dev dependency are used in development
npm i -D nodemon (D-> dev dependency )
after installing nodemon package.json me test ko dev kar do and do "dev" : "nodemon src/index.js"

mongodb atlas pr new project create karo
username and password  jake dekhlena 
for using atlas we need ip address and username and password
production grade application me hm kabhi bhi ip address ki allow access from anywhere nhi karte h
Network Access
Database Access
Database -> connect aur url me last me / nhi hota h

DB connections can be done in two ways : 1. directly in index.js  2. creating connection code in a separate folder and then importing it into index.js

app hoga express ke through and database connection hoga mongoose ke through

dotenv package -> important as early as possible loads env variables
mongoose.connect me atlas wala url daal denge

imp points : 
i)database se connect karte waqt error aa sakti hai to hamesha try catch  ya phir promise me wrap karo
ii)database is always in another continent toh async await lagana padega

"dev": "nodemon src/index.js"
"dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"

if anything is changed in env you need to reload

express me imp req.body and req.params 

middlewares -> checking wala matlab if any /admin is there then it need to be checked 
(err,req,res,next) next is for midddlewares

multer package for file explorer.