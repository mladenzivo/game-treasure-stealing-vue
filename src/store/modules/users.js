import Users from '@/api/UserApi'
import { getToken, setToken, removeToken, getRefreshToken, setRefreshToken, removeRefreshToken } from '@/utilities/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    refresh_token: getRefreshToken(),
    wallet: '',
    user: {},
    heroes_mint: []
  }
}

const state = getDefaultState();

const getters = {
  heroes(state, getters, rootState){
    if(rootState.nfts === undefined)
      return [];
    return _.filter(rootState.nfts, nft => {
      return state.heroes_mint.indexOf(nft.mint) > -1;
    });
  },

  isLoggedIn(state){
    return state.token? true: false;
  }
}

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },

  SET_TOKEN: (state, token) => {
    state.token = token
  },

  SET_REFRESH_TOKEN: (state, token) => {
    state.refresh_token = token
  },

  SET_FULLNAME: (state, fullname) => {
    state.fullname = fullname
  },

  SET_WALLET: (state, wallet) => {
    state.wallet = wallet
  },

  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },

  SET_USER: (state, user) => {
    state.user = user
  },

  SET_HEROES_MINT: (state, list) => {
    state.heroes_mint = list;
  }
}

const actions = {
  login({ commit }, userInfo) {
    const { email, password } = userInfo
    return new Promise((resolve, reject) => {
      Users.login({ email: email.trim(), password: password }).then(response => {
        const { data } = response
        commit('SET_TOKEN', data.token)
        commit('SET_REFRESH_TOKEN', data.refresh_token)
        setToken(data.token)
        setRefreshToken(data.refresh_token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  refreshToken({ state, commit }) {
    return new Promise((resolve, reject) => {
      let data = {
        refresh_token: state.refresh_token
      }

      Users.refreshToken(data).then(response => {
        const { data } = response

        if(data.token !== null){
          commit('SET_TOKEN', data.token)
          setToken(data.token)
        }else{
          removeToken()
          removeRefreshToken();
        }
        
        resolve(response)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ state, commit }) {
    return new Promise((resolve, reject) => {
      Users.getInfo().then(response => {
        const { data } = response
        let user = data.user;
        let heroes = data.heroes;

        commit('SET_WALLET', user.wallet);
        commit('SET_USER', user);
        commit('SET_HEROES_MINT', heroes);
        resolve(data);
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ state, commit }) {
    return new Promise((resolve, reject) => {
      Users.logout().then(() => {
        removeToken() // must remove  token  first
        removeRefreshToken() // must remove  token  first

        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}