const { expect } = require("chai");
const { ethers } = require("hardhat");

require("@nomicfoundation/hardhat-chai-matchers");
describe("ERCToken", async function(){

 let owner;
 let addr1;
 let addr2;
 let ERCToken;
 let TokenFactory;

   beforeEach(async function(){
    [owner,addr1,addr2]=await ethers.getSigners();
    TokenFactory = await ethers.getContractFactory("ERC20Token");
    ERCToken = await TokenFactory.deploy(3000);
   })

  describe("Deployment", function(){

    it("Should set the correct name", async function(){
        expect(await ERCToken.name()).to.equal("Indian Rupee");
    })

    it("Should set the correct symbol", async function(){
        expect(await ERCToken.symbol()).to.equal("INR");
    })

    it("Should set the correct decimals", async function(){
        expect(await ERCToken.decimals()).to.equal(18);
    })

    it("Should set the correct total supply", async function(){
        expect(await ERCToken.totalSupply()).to.equal(ethers.parseUnits("3000",18));
    })

    it("Should assign the total supply to the deployers balance ", async function(){
        expect(await ERCToken.balanceOf(owner.address)).to.equal(await ERCToken.totalSupply());
    })

    it("Should emit a Transfer event from address(0) to deployer on deployment", async function(){
       
        const TokenFactory = await ethers.getContractFactory("ERC20Token");
        const deployedContract = await TokenFactory.deploy(3000);
        
        
        const deploymentTx = await deployedContract.deploymentTransaction();
        
        await expect(deploymentTx)
          .to.emit(deployedContract, "Transfer")
          .withArgs("0x0000000000000000000000000000000000000000", owner.address, ethers.parseUnits("3000", 18));
    })

  })

  describe("Transfer function tests", function(){


    it("should transfer token correctly between accounts", async function(){

        const tokensTotransfer=1000000

        const transfer= await ERCToken.transfer(addr1.address,tokensTotransfer);

        expect(await ERCToken.balanceOf(addr1.address)).to.equal(1000000);

        expect(await ERCToken.balanceOf(owner.address)).to.equal(await ERCToken.totalSupply()-1000000n);

        await ERCToken.connect(addr1).transfer(addr2,500000);
        expect(await ERCToken.balanceOf(addr2.address)).to.equal(500000);
        expect(await ERCToken.balanceOf(addr1.address)).to.equal(500000);


     


    })


    
    it("should update senders and receivers balance after transfer", async function(){

        const tokensTotransfer=1000000

        const transfer= await ERCToken.transfer(addr1.address,tokensTotransfer);

        expect(await ERCToken.balanceOf(addr1.address)).to.equal(1000000);

        expect(await ERCToken.balanceOf(owner.address)).to.equal(await ERCToken.totalSupply()-1000000n);

        await ERCToken.connect(addr1).transfer(addr2,500000);
        expect(await ERCToken.balanceOf(addr2.address)).to.equal(500000);
        expect(await ERCToken.balanceOf(addr1.address)).to.equal(500000);


     


    })

    it("Should emit transfer event on successful transfer", async function(){


    
         expect(await ERCToken.transfer(addr1,1000)).to.emit(ERCToken,"Transfer").withArgs(owner.address,addr1.address,1000)

         expect(await ERCToken.transfer(addr2,1000)).to.emit(ERCToken,"Transfer").withArgs(addr1.address,addr2.address,1000);

    })

    it("Should fail if sender does't have enough balance",async function(){



        await expect(ERCToken.connect(addr1).transfer(addr2,100)).to.be.revertedWith("Not enough tokens");

    })

    it("Should fail if the recipient address is zero", async function(){


        await expect(ERCToken.transfer(ethers.ZeroAddress,1000)).to.be.rejectedWith("Not a valid recipient address");
    })

  
  })

})