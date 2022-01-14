// APS 1050 PROJECT
// D-VOTING
// YANGFAN LI
// 1003152982

const BalanceVote = artifacts.require("BalanceVote");
const BalanceWithBlockVote = artifacts.require("BalanceWithBlockVote");
const BalanceWithMinBalanceVote = artifacts.require("BalanceWithMinBalanceVote");
const EvenVote = artifacts.require("EvenVote");
const EvenWithBlockVote = artifacts.require("EvenWithBlockVote");
const EvenWithMinBalanceVote = artifacts.require("EvenWithMinBalanceVote");

module.exports = function(deployer) {
	deployer.deploy(BalanceVote);
	deployer.deploy(BalanceWithBlockVote);
	deployer.deploy(BalanceWithMinBalanceVote);
	deployer.deploy(EvenVote);
	deployer.deploy(EvenWithBlockVote);
	deployer.deploy(EvenWithMinBalanceVote);
};
