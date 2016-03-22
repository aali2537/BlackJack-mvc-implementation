$( document ).ready(function() {
    //The model will hold the current state of the deck, player's hand, and dealer's hand
    function classModel(playerHand,dealerHand,deck){
        this.playerHand = playerHand;
        this.dealerHand = dealerHand;
        this.deck = deck;
    }
    classModel.prototype = {
        //clears the dealer and players hands
        clearHands : function(){
            this.playerHand = [];
            this.dealerHand = [];
        },
        //remove element at index from deck array
        remove : function(index){
            this.deck.splice(index,1);
        },
        //returns "num" amount of cards, and removes them from the deck
        deal : function(num){
            var output = [];
            for (var i = 0; i < num; i++){
                var randomNumber = Math.floor(Math.random() * this.deck.length);
                output.push(this.deck[randomNumber]);
                this.remove(randomNumber);
            }
            return output;
        },
        //add cards back to deck
        addDeck : function(cards){
            for(var i = 0; i < cards.length; i++){
                this.deck.push(cards[i]);
            }
        },
        //add cards to the player's hand
        addPlayerHand : function(cards){
            for(var i = 0; i < cards.length; i++){
                this.playerHand.push(cards[i]);
            }
        },
        //add cards to the dealer's hand
        addDealerHand : function(cards){
            for(var i = 0; i < cards.length; i++){
                this.dealerHand.push(cards[i]);
            }
        },
        //return player's current hand
        getPlayerHand : function(){
            return this.playerHand;
        },
        //return dealer's current hand
        getDealerHand : function(){
            return this.dealerHand;
        },
        //sets card facedown given the index
        setFaceDown : function(index){
            this.dealerHand[index].faceup = "false";
        },
        //sets card faceup given index
        setFaceUp : function(index){
            this.dealerHand[index].faceup = "true";
        }
    };
    //The view will render whatever cards the controller passes along to it, as well notify the controller when a user action has occurred
    function classView(){
        //Add static hit and stay buttons to the page, as well as text
        $("#buttonContainer").append("<button name='hit' >Hit!</button>\n <button name='stay' >Stay!</button>");
        $("#dealerContainer").append("<div> Dealer Hand: </div>");
        $("#playerContainer").append("<div> Player Hand: </div>");
        $("#restartContainer").append("<button name='replay' >Replay!</button>");
        
        //add listeners for button clicks, and notify the controller when an action has occurred
        $( "button[name='hit']" ).click(function() {
            controller.hitHandler();
        });
        
        $( "button[name='stay']" ).click(function() {
            controller.stayHandler();
        });
        
        $( "button[name='replay']" ).click(function() {
            controller.restart();
        });
        this.hideRestart();
            
    }
    classView.prototype = {
        //adds restart button, wipes message, and adds listener
        showRestart : function(){
            $( "#restartContainer").show();
        },
        hideRestart : function(){
            $( "#restartContainer").hide();
        },
        //hides hit and stay buttons, and reveals restart button
        hideButtons : function(){
            $( "#buttonContainer").hide();
            this.showRestart();
        },
        //unhides hit and stay buttons
        showButtons : function(){
            $( "#buttonContainer").show();
        },
        //Sets message in the msgContainer to whatever is in the argument
        setMessage : function(msg){
            $("#msgContainer").html(msg);
        },
        //takes card array and renders the card images for the dealer hand
        renderDealerHand : function(cards){
            //wipe container clean
            $("#dealerContainer").html("<div> Dealer Hand: </div>");
            for (var i = 0; i < cards.length; i++){
                //determines whether to render card image face up or down
                if(cards[i].faceup === "true"){
                    $("#dealerContainer").append("<img src='graphics/" + cards[i].name + ".png' height = '150' width = '100'></img>\n");
                }
                else{
                    $("#dealerContainer").append("<img src='graphics/back.png' height = '150' width = '100'></img>\n");
                }
            }
        },
        //same as renderDealerHand but renders for the player hand area
        renderPlayerHand : function(cards){
            //wipe container clean
            $("#playerContainer").html("<div> Player Hand: </div>");
            for (var i = 0; i < cards.length; i++){
                //determines whether to render card image face up or down
                if(cards[i].faceup === "true"){
                    $("#playerContainer").append("<img src='graphics/" + cards[i].name + ".png' height = '150' width = '100'></img>\n");
                }
                else{
                    $("#playerContainer").append("<img src='graphics/back.png' height = '150' width = '100'></img>\n");
                }
            }
        }
    };
    //The controller will contact the model for necessary data, handle user actions when notified by the view, and pass along the necessary data for the view to render.
    function classController(model,view){
        this.model = model;
        this.view = view;

    }
    classController.prototype = {
        restart : function(){
            this.view.setMessage("");
            var dealerHand = this.model.getDealerHand();
            var playerHand = this.model.getPlayerHand();
            
            this.view.hideRestart();
            this.view.showButtons();
            //Shuffle dealer's cards back into the deck 
            this.model.addDeck(dealerHand);
            //Shuffle Player's cards back into the deck
            this.model.addDeck(playerHand);
            this.model.clearHands();
            this.start();
            
        },
        //starts game by dealing initial hands out and rendering them
        start : function(){
            //deal cards to dealer and player initially and set second dealer card face down
            this.model.addDealerHand(this.model.deal(2));
            this.model.setFaceDown(1);
            this.model.addPlayerHand(this.model.deal(2));
            //Pass dealer and player hands to the view for rendering
            this.view.renderDealerHand(this.model.getDealerHand());
            this.view.renderPlayerHand(this.model.getPlayerHand());
        },
        //Simulates the dealer's turn after players have finished their actions
        dealerTurn : function(){
            //set second card faceup
            this.model.setFaceUp(1);
            curScore = this.calculateValue(this.model.getDealerHand());
            //check to see if the dealer's hand is less than 17, if so hit
            while(curScore < 17){
                this.model.addDealerHand(this.model.deal(1));
                curScore = this.calculateValue(this.model.getDealerHand());
            }
            this.view.renderDealerHand(this.model.getDealerHand());
            console.log(curScore);
            console.log(this.calculateValue(this.model.getPlayerHand()));
            if(curScore > 21){
                //if dealer is over 21, set appropiate message
                this.view.setMessage("Dealer Busted!");
                this.view.hideButtons();
                
            }
            else{
                if (curScore > this.calculateValue(this.model.getPlayerHand())){
                    this.view.setMessage("Dealer Wins!");
                    this.view.hideButtons();
                }
                else{
                    if(curScore === this.calculateValue(this.model.getPlayerHand())){
                        this.view.setMessage("Tie!");
                        this.view.hideButtons();
                    }
                    else{
                        this.view.setMessage("Player Wins!");
                        this.view.hideButtons();
                        
                    }
                }
            }
        },
        //calculates numeric value of a hand
        calculateValue : function(hand){
            var total = 0;
            var ace_total = 0;
            //calculate separate total in case ace is treated with a value of 1
            for (var i = 0; i < hand.length; i++){
                total += parseInt(hand[i].value);
                if(hand[i].value === "11"){
                    ace_total += 1;
                }
                else{
                    ace_total += parseInt(hand[i].value);
                }
            }
            if( total <= 21){
                return total;
            }
            else{
                return ace_total;
            }
        },
        //handles when the hit button is clicked
        hitHandler : function(){
            var temp = this.model.getPlayerHand();
            var curScore = this.calculateValue(temp);
                this.model.addPlayerHand(this.model.deal(1));
                this.view.renderPlayerHand(this.model.getPlayerHand());
                if (this.calculateValue(this.model.getPlayerHand()) > 21){
                    this.model.setFaceUp(1);
                    this.view.renderDealerHand(this.model.getDealerHand());
                    this.view.setMessage("Player Busted!");
                    this.view.hideButtons();
                }
        },
        //handles when the stay button is clicked
        stayHandler : function(){
            this.dealerTurn();
        }
    };
    //instantiating model object with initial player hand, dealer hand, and deck
    var model = new classModel([],[],[
        {
            "name": "ace_of_clubs",
            "value": "11",
            "faceup": "true"
        },
        {
            "name": "2_of_clubs",
            "value": "2",
            "faceup": "true"
        },
        {
            "name": "3_of_clubs",
            "value": "3",
            "faceup": "true"
        },
        {
            "name": "4_of_clubs",
            "value": "4",
            "faceup": "true"
        },
        {
            "name": "5_of_clubs",
            "value": "5",
            "faceup": "true"
        },
        {
            "name": "6_of_clubs",
            "value": "6",
            "faceup": "true"
        },
        {
            "name": "7_of_clubs",
            "value": "7",
            "faceup": "true"
        },
        {
            "name": "8_of_clubs",
            "value": "8",
            "faceup": "true"
        },
        {
            "name": "9_of_clubs",
            "value": "9",
            "faceup": "true"
        },
        {
            "name": "10_of_clubs",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "jack_of_clubs",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "queen_of_clubs",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "king_of_clubs",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "ace_of_diamonds",
            "value": "11",
            "faceup": "true"
        },
        {
            "name": "2_of_diamonds",
            "value": "2",
            "faceup": "true"
        },
        {
            "name": "3_of_diamonds",
            "value": "3",
            "faceup": "true"
        },
        {
            "name": "4_of_diamonds",
            "value": "4",
            "faceup": "true"
        },
        {
            "name": "5_of_diamonds",
            "value": "5",
            "faceup": "true"
        },
        {
            "name": "6_of_diamonds",
            "value": "6",
            "faceup": "true"
        },
        {
            "name": "7_of_diamonds",
            "value": "7",
            "faceup": "true"
        },
        {
            "name": "8_of_diamonds",
            "value": "8",
            "faceup": "true"
        },
        {
            "name": "9_of_diamonds",
            "value": "9",
            "faceup": "true"
        },
        {
            "name": "10_of_diamonds",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "jack_of_diamonds",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "queen_of_diamonds",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "king_of_diamonds",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "ace_of_hearts",
            "value": "11",
            "faceup": "true"
        },
        {
            "name": "2_of_hearts",
            "value": "2",
            "faceup": "true"
        },
        {
            "name": "3_of_hearts",
            "value": "3",
            "faceup": "true"
        },
        {
            "name": "4_of_hearts",
            "value": "4",
            "faceup": "true"
        },
        {
            "name": "5_of_hearts",
            "value": "5",
            "faceup": "true"
        },
        {
            "name": "6_of_hearts",
            "value": "6",
            "faceup": "true"
        },
        {
            "name": "7_of_hearts",
            "value": "7",
            "faceup": "true"
        },
        {
            "name": "8_of_hearts",
            "value": "8",
            "faceup": "true"
        },
        {
            "name": "9_of_hearts",
            "value": "9",
            "faceup": "true"
        },
        {
            "name": "10_of_hearts",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "jack_of_hearts",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "queen_of_hearts",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "king_of_hearts",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "ace_of_spades",
            "value": "11",
            "faceup": "true"
        },
        {
            "name": "2_of_spades",
            "value": "2",
            "faceup": "true"
        },
        {
            "name": "3_of_spades",
            "value": "3",
            "faceup": "true"
        },
        {
            "name": "4_of_spades",
            "value": "4",
            "faceup": "true"
        },
        {
            "name": "5_of_spades",
            "value": "5",
            "faceup": "true"
        },
        {
            "name": "6_of_spades",
            "value": "6",
            "faceup": "true"
        },
        {
            "name": "7_of_spades",
            "value": "7",
            "faceup": "true"
        },
        {
            "name": "8_of_spades",
            "value": "8",
            "faceup": "true"
        },
        {
            "name": "9_of_spades",
            "value": "9",
            "faceup": "true"
        },
        {
            "name": "10_of_spades",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "jack_of_spades",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "queen_of_spades",
            "value": "10",
            "faceup": "true"
        },
        {
            "name": "king_of_spades",
            "value": "10",
            "faceup": "true"
        }
    ]);
    var view = new classView();
    var controller = new classController(model,view);
    controller.start();
});