export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

autoload -U add-zsh-hook
load-nvmrc() {
  if [ -f .nvmrc ]; then
    nvm use > /dev/null
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
