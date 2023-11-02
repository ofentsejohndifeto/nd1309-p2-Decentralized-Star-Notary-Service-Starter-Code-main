const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
}); // his test does not work and it was not part of the task

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    let instance = await StarNotary.deployed(); // getting the instance of deployed star contract
    let starName = await instance.starName.call(); // Calling the starName variable set in the constructor
    let starSymbol = await instance.starSymbol.call(); //calling starSymbol variable set in teh constructor
    assert.equal(starName, "Star Token"); // Assert if the starName property was initialized correctly and is equal to the star name in teh equal condition
    assert.equal(starSymbol, "STTO");
});


it('lets 2 users exchange stars', async() => {
    const instance = await StarNotary.deployed(); // retrieving deployed contract instance

    // Create 2 Stars with different tokenIds
    let starId1 = 6; //stars always need new token ID's for each test
    let starId2 = 7;

    await instance.createStar('Star 1', starId1, { from: accounts[0] }); // each star is created and assigned an owner 
    await instance.createStar('Star 2', starId2, { from: accounts[1] }); // each star is created and assigned an owner

    // Get the initial owners of the stars
    const owner1 = await instance.ownerOf(starId1); //ownerOf method used to get stars owner
    const owner2 = await instance.ownerOf(starId2);

    // Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId1, starId2, { from: accounts[0] }); // the method initialised iin StarNotary.sol is called to exchange the stars, obviously checking that teh first account owns a star

    // Get the new owners after the exchange
    const newOwner1 = await instance.ownerOf(starId1); //still using ownerOf to check each owner has changed
    const newOwner2 = await instance.ownerOf(starId2);

    // Verify that the owners changed
    assert.equal(newOwner1, owner2);
    assert.equal(newOwner2, owner1);
});


it('lets a user transfer a star', async() => {
    const instance = await StarNotary.deployed(); // at this stage you know what this is for lol

    // Create a Star with a unique tokenId
    let starId = 18;
    await instance.createStar('Unique Star', starId, { from: accounts[0] });

    // Get the initial owner of the star
    const owner = await instance.ownerOf(starId); // just checks if star is owned by owner, variable not called agin but i just feel it is good practise

    // Use the transferStar function implemented in the Smart Contract
    await instance.transferStar(accounts[1], starId, { from: accounts[0] });

    // Get the new owner after the transfer
    const newOwner = await instance.ownerOf(starId);

    // Verify the star owner changed
    assert.equal(newOwner, accounts[1]); 
});


it('lookUptokenIdToStarInfo test', async() => {
    const instance = await StarNotary.deployed();

    // Create a Star with a unique tokenId
    let starId = 9;
    let starName = 'Shining Star';
    await instance.createStar(starName, starId, { from: accounts[0] });

    // Call the method lookUptokenIdToStarInfo
    let retrievedStarName = await instance.lookUptokenIdToStarInfo(starId); //looUpTokenIdToStarInfo method used starId to get the star name

    // Verify if your Star name is the same
    assert.equal(retrievedStarName, starName);
});
