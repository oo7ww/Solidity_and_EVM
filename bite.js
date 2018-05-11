//compile and deploy
const solc = require('solc');
const Web3 = require('web3');
const fs = require('fs');

//default address
let address = '';
let privateKey = '';//prefix '0x'

//rpcHost
let rpcHost = 'http://localhost:8381';

class ContractBiter {
    constructor(rpcHost) {
        this.web3 = new Web3(rpcHost);
    }
    
    //use privateKey to Sign and Deploy contract
    async deploy(address, privateKey, name, solFile, callback) {
        console.log('start biting');
        this.address = address;
        this.privateKey = privateKey;

        const input = fs.readFileSync(solFile);
        console.log('sol src loaded');

        const output = solc.compile(input.toString(), 1);
            
        const bytecode = output.contracts[`:${name}`].bytecode;
        console.log(bytecode);
        
        const abi = JSON.parse(output.contracts[`:${name}`].interface);
        console.log(abi);
        
        const contract = new this.web3.eth.Contract(abi);

        var tx = {data: '0x' + bytecode, gas: 150000};

        this.eth.accounts.signTransaction(tx, this.privateKey)
            .then(signed => {
                console.log('signature returned');
                this.web3.eth.sendSignedTransaction(signed.rawTransaction);
                console.log('bite_contract deployed');
            }).catch(err => {
                console.info(err);
            });
    }

    async encodeABI_deploy(address, privateKey, name, solFile, callback) {
        console.log('start biting');
        this.address = address;
        this.privateKey = privateKey;

        const input = fs.readFileSync(solFile);
        console.log('sol src loaded');

        const output = solc.compile(input.toString(), 1);
            
        const bytecode = output.contracts[`:${name}`].bytecode;
        console.log(bytecode);
        
        const abi = JSON.parse(output.contracts[`:${name}`].interface);
        console.log(abi);

        const contract = new this.web3.eth.Contract(abi);

        let nonce = await this.web3.eth.getTransactionCount(address);
        console.log('nonce:' + nonce);

        let encodeABI = contract
            .deploy({
              data:bytecode,
              arguments:[]
        })
        .encodeABI();

        let tx = {
            nonce: nonce,
            from: this.address,
            gas: 1500000,
            gasPrice: "0",
            data: "0x" + encodeABI
          };
      
        this.web3.eth.accounts
          .signTransaction(tx, this.privateKey)
          .then(signed => {
              console.log("hello");
              this.web3.eth
                .sendSignedTransaction(signed.rawTransaction)
                  .then(contractInstance => {
                      console.log(contractInstance.contractAddress);
                  }).catch(err => {
                      console.info(err);
                  });
            }).catch(err => {
              console.info(err);
            });
    }
}

console.log(address);
let bite = new ContractBiter(rpcHost);

bite.deploy(address, privateKey, 'YOUCustomeToken', 'new.sol', function(err){
    console.info(err);
});

