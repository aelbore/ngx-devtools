# ngx-devtools

## Getting Started 

* Clone repository
  ```
  git clone https://github.com/aelbore/ngx-devtools.git
  ```
* Update submodules
  ```
   git submodule init
   git submodule update --remote
  ```
* Install dependencies
  ```
   npm install
  ```
* Build Application
  ```
  npm run package.init
  npm run build
  ```
  - this will build, watch the file changes, live reload and open browser

<br />

##### Delete dist and .tmp folder
```
npm run clean.all
```