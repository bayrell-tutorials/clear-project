# Install clear project

Install Bayrell Language
```
npm install -g bayrell-lang-compiler --unsafe-perm
```

Clone repository:
```
git clone https://github.com/bayrell/clear-project
cd clear-project
git submodule init
git submodule update --init --recursive
```

Compile all project
```
bayrell-lang-nodejs build
bayrell-lang-nodejs make_symlinks
```

Watch changes:
```
bayrell-lang-nodejs watch
```
