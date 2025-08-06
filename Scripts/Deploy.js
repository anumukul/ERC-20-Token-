async function main(){


    const Token=await ethers.getContractFactory("ERC20Token");

    const ERC20Token=await Token.deploy(3000);

    console.log("Deploying contract");


    await ERC20Token.waitForDeployment();

    console.log("contract deployed at address :", await ERC20Token.getAddress());



}


main().then(()=>process.exit(0)).catch((error)=>{

    console.log(error);
    process.exit(1);
})