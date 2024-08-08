document.addEventListener("alpine:init", () => {

    Alpine.data('pizzaCart', () => {
        return {
            title: 'Pizza Cart API',
            pizzas: [],
            username: '',
            cartId: '',
            cartPizzas: [],
            cartTotal: 0.00,
            paymentAmount: 0,
            message: '',
            featuredPizzas: [],
            Login () {
                if (this.username.length > 2) {
                    localStorage['username'] = this.username;
                    this.createCart();
                } else {
                    alert("username is too short")
                }
                
            },
            logout() {
                if (confirm('Do you want to logout?')) {
                    this.username = '';
                this.cartId = '';
                localStorage['cartId'] = '';
                localStorage['username'] = '';

                }
                
            },

            
            createCart() {
                if (!this.username) {
                    //this.cartId = 'No username to create a cart for'
                    return Promise.resolve();

                }
                

                const cartId = localStorage['cartId']
                if (cartId) {
                    this.cartId = cartId;
                    return Promise.resolve;
                } else {
                    const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username=${this.username}`;
                    
                    const cartId = localStorage['cartId']
                    
                    return axios.get(createCartURL)
                            .then(result =>{
                                this.cartId = result.data.cart_code;
                                localStorage['cartId'] = this.cartId;
                            });
                }
                

            },

            getCart() {
                const getCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`
                return axios.get(getCartURL);
            },

            getFeaturedPizzas() {
                const getFeaturedPizzasURL = `https://pizza-api.projectcodex.net/api/pizzas/featured?username=${this.username}`;
                axios.get(getFeaturedPizzasURL)
                    .then(response => {
                        if (response.data && Array.isArray(response.data.pizzas)) {
                            this.featuredPizzas = response.data.pizzas.slice(0, 3);
                            console.log(response);
                        } else {
                            this.featuredPizzas = [];
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching featured pizzas:', error);
                        this.featuredPizzas = [];
                    });
            },
            
            
            setFeaturedPizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizzas/featured', {
                    username: this.username,
                    pizza_id: pizzaId
                }, { headers: { 'Cache-control': 'no-store' } })
                .then(() => {
                    this.getFeaturedPizzas(); 
                })
                .catch(error => {
                    console.error('Error setting featured pizza:', error);
                    throw error; 
                });
            },
            
            addPizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add',{
                    "cart_code" : this.cartId,
	                "pizza_id" : pizzaId     
                })
                .then(() => {
                    this.showCartData();
                })

            },
            removePizza(pizzaId) {
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/remove',{
                    "cart_code" : this.cartId,
	                "pizza_id" : pizzaId     
                })
                
            },
            pay(amount){
                return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/pay',
                {
                    "cart_code" : this.cartId,
                    amount
                });
            },
            showCartData() {
                this.getCart().then(result => {

                    const cartData = result.data;
                    this.cartData = result.data;
                    this.cartPizzas = cartData.pizzas;
                    this.cartTotal = cartData.total?.toFixed(2);
                    this.featuredPizzas = result.data.pizzas
                    //alert(this.cartTotal);
                });

            },
            // addPizza(pizzaId) {

            //     return axios.post('https://pizza-api.projectcodex.net/api/pizza-cart/add', {
            //         "cart_code": this.cartId,
            //         "pizza_id": pizzaId
            //     })
            //         .then(() => {
            //             this.showCartData();
            //         })

            // },

            init() {
                const storedUsername =  localStorage['username'];
                if (storedUsername)
                this.username = storedUsername;
                axios.get('https://pizza-api.projectcodex.net/api/pizzas')
                    .then(result => {
                        this.pizzas = result.data.pizzas;
            
                        if (!this.cartId) {
                            
                            this.createCart()
                            .then(() => {
                                    this.getFeaturedPizzas();
                                    this.showCartData();
                                })
                        
                        }
                    })
                    
            },
            
            addPizzaToCart(pizzaId) {
                //alert(pizzaId)
                this
                .addPizza(pizzaId)
                .then(() => {
                    this.showCartData();
                })
            },
            

            removePizzaFromCart(pizzaId) {
                //alert(pizzaId)
                this.removePizza(pizzaId)
                .then(() => {
                    this.showCartData();
                })

            },

            payForCart() {
            //alert("pay now : " + this.paymentAmount)
            this
                .pay(this.paymentAmount)
                .then(result => {
                    if (result.data.status == 'failure') {
                        this.message = result.data.message;
                        setTimeout(() => this.message = '', 3000);
                    } else {
                        this.message = 'payment received';
                        setTimeout(() => {
                            this.message = '',
                            this.cartPizzas = [];
                            this.cartTotal = 0.00
                            this.cartId = ''
                            this.paymentAmount = 0;
                            localStorage['cardId'] = '';
                            this.createCart();
                            
                         }, 3000);
                    }
                })
            }


        }
    });
});