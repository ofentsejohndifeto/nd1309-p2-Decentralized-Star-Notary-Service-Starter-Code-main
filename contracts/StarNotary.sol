// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.4.24;

//Importing openzeppelin-solidity ERC-721 implemented Standard
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

// StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    string public constant starName = "Star Token"; // Star name
    string public constant starSymbol = "STTO";    // symbol of token
    
    // Star data
    struct Star {
        string name;
    }
 
    constructor() public {
        starName; //initialised star name in constructor
        starSymbol; //initialised star symbol in constructor
    } 
    // Implement Task 1 Add a name and symbol properties
    // name: Is a short name to your token
    // symbol: Is a short string like 'USD' -> 'American Dollar'
    

    // mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    
    // Create Star using the Struct
    function createStar(string memory _name, uint256 _tokenId) public { // Passing the name and tokenId as a parameters
        Star memory newStar = Star(_name); // Star is an struct so we are creating a new Star
        tokenIdToStarInfo[_tokenId] = newStar; // Creating in memory the Star -> tokenId mapping
        _mint(msg.sender, _tokenId); // _mint assign the the star with _tokenId to the sender address (ownership)
    }

    // Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // Function that allows you to convert an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public  payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        _transferFrom(ownerAddress, msg.sender, _tokenId); // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        address payable ownerAddressPayable = _make_payable(ownerAddress); // We need to make this conversion to be able to use transfer() function to transfer ethers
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo
    function lookUptokenIdToStarInfo(uint _tokenId) public view returns (string memory) {
        require(bytes(tokenIdToStarInfo[_tokenId].name).length > 0, "Star with the provided token ID does not exist"); //convertsing name string to bytes and checks length to show that a star exists
        return tokenIdToStarInfo[_tokenId].name; //returns star with tokenId
    }

    // Implement Task 1 Exchange Stars function
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        address owner1 = ownerOf(_tokenId1); //gets address of owner who owns that tokenId
        address owner2 = ownerOf(_tokenId2); //this relates to the mapping TokenIdToStarInfo which gives ownership to person who created the star

        require(msg.sender == owner1 || msg.sender == owner2, "The sender is not the owner of the tokens"); // this checks if the caller of teh fucntion is the owner of either star

        // Perform the token exchange
        _transferFrom(owner1, owner2, _tokenId1); //transfers star of tokenId1 from owner1 to owner2
        _transferFrom(owner2, owner1, _tokenId2); //transfers star of tokenId2 from owner2 to owner1
        //with would be a probelm in development because tehre could be different values with each star and there is no verification that the msg.sender communicated with teh other star owner
    }


    // Implement Task 1 Transfer Stars
    function transferStar(address _futureOwner, uint256 _tokenId) public {
        require(ownerOf(_tokenId) == msg.sender, "You are not the owner of the token"); // checks if the msg.sender is teh actual woner of the star with error message if they are not the owner
        transferFrom(msg.sender, _futureOwner, _tokenId); //initiates transfer of token
    }


}
