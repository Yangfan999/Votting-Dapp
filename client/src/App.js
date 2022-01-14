// APS 1050 PROJECT
// D-VOTING
// YANGFAN LI
// 1003152982

import React, { Component } from "react";

import{
	AppBar,
	Chip,
	Button,
	Card,
	CardActions,
	CardContent,
	CssBaseline,
	Grid,
	Box,
	Toolbar,
	Typography,
	Container
} from "@mui/material";

import { createTheme, ThemeProvider } from "@mui/material/styles";

import getWeb3 from "./getWeb3";
import BalanceVote from "./contracts/BalanceVote.json";
import BalanceWithBlockVote from "./contracts/BalanceWithBlockVote.json";
import BalanceWithMinBalanceVote from "./contracts/BalanceWithMinBalanceVote.json";
import EvenVote from "./contracts/EvenVote.json";
import EvenWithBlockVote from "./contracts/EvenWithBlockVote.json";
import EvenWithMinBalanceVote from "./contracts/EvenWithMinBalanceVote.json";

import PostModal from "./components/PostModal/PostModal.js";
import VoteModal from "./components/VoteModal/VoteModal.js";

import "./App.css";

// ------ GLOBALS ------
const NAME_LABEL_MAPPING = {
	"evenly": "Voting Power Evenly Distributed",
	"simple": "Everyone Can Vote",
	"min-balance": "Minimum Balance Required",
	"tex-time": "First Transaction Required Before Certain Time",
	"balance": "Voting Power Based On Balance"
};

class App extends Component {
	state = {
		web3: null,
		accounts: null,
		balanceVoteContract: null,
		balanceVoteProposals: [],
		balanceWithBlockVoteContract: null,
		balanceWithBlockVoteProposals: [],
		balanceWithMinBalanceVoteContract: null,
		balanceWithMinBalanceVoteProposals: [],
		evenVoteContract: null,
		evenVoteProposals: [],
		evenWithBlockVoteContract: null,
		evenWithBlockVoteProposals: [],
		evenWithMinBalanceVoteContract: null,
		evenWithMinBalanceVoteProposals: [],

		showType: "all",
		createModalOpen: false,
		voteModal: null
	};

	componentDidMount = async () => {
		try {
			// Get web3 and existing proposals
			const web3 = await getWeb3();
			this.setState({ web3 }, () => {
				this._getAll();
			});
		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Failed to load proposals. Check console for details.`
			);
			console.error(error);
		}
	};

	_getAll = async () => {
		const web3 = this.state.web3;
		const netId = await web3.eth.net.getId();
		const balanceVoteNetwork = BalanceVote.networks[netId];
			const balanceVote =
				new web3.eth.Contract(BalanceVote.abi, balanceVoteNetwork.address);
			const balanceVoteProposals = await this._getProposals(balanceVote);
			balanceVoteProposals.forEach((p) => {
				p.type = "balance";
				p.strategy = "simple"
			});

			const balanceWithBlockVoteNetwork = BalanceWithBlockVote.networks[netId];
			const balanceWithBlockVote =
				new web3.eth.Contract(BalanceWithBlockVote.abi, balanceWithBlockVoteNetwork.address);
			const balanceWithBlockVoteProposals = await this._getProposals(balanceWithBlockVote);
			balanceWithBlockVoteProposals.forEach((p) => {
				p.type = "balance";
				p.strategy = "tex-time"
			});

			const balanceWithMinBalanceVoteNetwork = BalanceWithMinBalanceVote.networks[netId];
			const balanceWithMinBalanceVote =
				new web3.eth.Contract(BalanceWithMinBalanceVote.abi, balanceWithMinBalanceVoteNetwork.address);
			const balanceWithMinBalanceVoteProposals = await this._getProposals(balanceWithMinBalanceVote);
			balanceWithMinBalanceVoteProposals.forEach((p) => {
				p.type = "balance";
				p.strategy = "min-balance"
			});

			const evenVoteVoteNetwork = EvenVote.networks[netId];
			const evenVote = new web3.eth.Contract(EvenVote.abi, evenVoteVoteNetwork.address);
			const evenVoteProposals = await this._getProposals(evenVote);
			evenVoteProposals.forEach((p) => {
				p.type = "evenly";
				p.strategy = "simple"
			});

			const evenWithBlockVoteNetwork = EvenWithBlockVote.networks[netId];
			const evenWithBlockVote =
				new web3.eth.Contract(EvenWithBlockVote.abi, evenWithBlockVoteNetwork.address);
			const evenWithBlockVoteProposals = await this._getProposals(evenWithBlockVote);
			evenWithBlockVoteProposals.forEach((p) => {
				p.type = "evenly";
				p.strategy = "tex-time"
			});

			const evenWithMinBalanceVoteNetwork = EvenWithMinBalanceVote.networks[netId];
			const evenWithMinBalanceVote =
				new web3.eth.Contract(EvenWithMinBalanceVote.abi, evenWithMinBalanceVoteNetwork.address);
			const evenWithMinBalanceVoteProposals = await this._getProposals(evenWithMinBalanceVote);
			evenWithMinBalanceVoteProposals.forEach((p) => {
				p.type = "evenly";
				p.strategy = "min-balance"
			});

			this.setState({
				balanceVoteContract: balanceVote,
				balanceVoteProposals,
				balanceWithBlockVoteContract: balanceWithBlockVote,
				balanceWithBlockVoteProposals,
				balanceWithMinBalanceVoteContract: balanceWithMinBalanceVote,
				balanceWithMinBalanceVoteProposals,
				evenVoteContract: evenVote,
				evenVoteProposals,
				evenWithBlockVoteContract: evenWithBlockVote,
				evenWithBlockVoteProposals,
				evenWithMinBalanceVoteContract: evenWithMinBalanceVote,
				evenWithMinBalanceVoteProposals
			});
	}

	_connectWallet = async () => {
		try {
			// Get web3 with account
			const web3 = await getWeb3(true);
			const accounts = await web3.eth.getAccounts();

			this.setState({ web3, accounts }, () => {
				this._getAll();
			});
		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Failed to load proposals. Check console for details.`
			);
			console.error(error);
		}
	};

	_createContract = async (value) => {
		const contractMapping = {
			"evenly": {
				"simple": this.state.evenVoteContract,
				"min-balance": this.state.evenWithMinBalanceVoteContract,
				"tex-time": this.state.evenWithBlockVoteContract
			},
			"balance": {
				"simple": this.state.balanceVoteContract,
				"min-balance": this.state.balanceWithMinBalanceVoteContract,
				"tex-time": this.state.balanceWithBlockVoteContract
			}
		};

		const contract = contractMapping[value.method][value.strategy];
		try {
			if (value.strategy === "min-balance") {
				const balance = this.state.web3.utils.toWei(value.minBalance, "ether");
				await contract.methods.add_proposal(value.name, value.body, value.options.join(), balance
				).send({ from: this.state.accounts[0], gas: 3000000 });
			} else if (value.strategy === "tex-time") {
				await contract.methods.add_proposal(value.name, value.body, value.options.join(), value.firstTexDate
				).send({ from: this.state.accounts[0], gas: 3000000 });
			} else {
				await contract.methods.add_proposal(value.name, value.body, value.options.join()
				).send({ from: this.state.accounts[0], gas: 3000000 });	
			}

			this._getAll();
			this.setState({
				createModalOpen: false
			});
		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Failed to add proposal. Check console for details.`
			);
			console.error(error);
		}
	};

	_getProposals = async (contract) => {
		try {
			const proposalCount = await contract.methods.vote_num().call();
			const proposals = [];
			for (let i=1; i < proposalCount; i++) {
				const proposal = await contract.methods.proposals(i).call();
				if (this.state.accounts) {
					const canVote = await contract.methods.voted_map(i, this.state.accounts[0]).call();
					proposal.canVote = !canVote;
				}
				proposals.push(proposal);
			};
			return proposals;
		} catch (error) {
			// Catch any errors for any of the above operations.
			alert(
				`Failed to get proposal. Check console for details.`
			);
			console.error(error);
		}
	}

	render() {
		const theme = createTheme({
			palette: {
				mode: "dark"
			}
		});

		const allProposals = [
			...this.state.balanceVoteProposals, 
			...this.state.balanceWithBlockVoteProposals, 
			...this.state.balanceWithMinBalanceVoteProposals, 
			...this.state.evenVoteProposals, 
			...this.state.evenWithBlockVoteProposals, 
			...this.state.evenWithMinBalanceVoteProposals
		].filter((proposal) => {
			if (this.state.showType === "all" ||
				(this.state.showType === "participated" && !proposal.canVote) ||
				(this.state.showType === "unparticipated" && proposal.canVote)) {
					return proposal;
			}
		});

		const contractMapping = {
			"evenly": {
				"simple": this.state.evenVoteContract,
				"min-balance": this.state.evenWithMinBalanceVoteContract,
				"tex-time": this.state.evenWithBlockVoteContract
			},
			"balance": {
				"simple": this.state.balanceVoteContract,
				"min-balance": this.state.balanceWithMinBalanceVoteContract,
				"tex-time": this.state.balanceWithBlockVoteContract
			}
		};

		return (
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<AppBar position="sticky" color="default">
					<Toolbar>
						<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
							<Box
								sx={{
									display: "inline",
									color: "#42a5f5"
								}}
							>
								D
							</Box> Vote
						</Typography>
						{this.state.accounts ? (
							<Button
								color="inherit"
								onClick={() => this.setState({ createModalOpen: true })}
							>
								Create New Vote
							</Button>
						) : (
							<Button
								color="inherit"
								onClick={this._connectWallet}
							>
								Connect Wallet
							</Button>
						)}
					</Toolbar>
				</AppBar>
				<Box
					sx={{
						bgcolor: "background.paper",
						pt: 8,
						pb: 6
					}}
				>
					<Container maxWidth="sm">
						<Typography
							component="h1"
							variant="h2"
							align="center"
							color="text.primary"
							gutterBottom
						>
							<Box
								component="h1"
								sx={{
									display: "inline",
									color: "#42a5f5"
								}}
							>
								D
							</Box> Vote
						</Typography>
						<Typography variant="h5" align="center" color="text.secondary" paragraph>
							Decentralized Voting System, create your own voting post by connect to your Ethereum wallet,<br/>
							it can be &nbsp;
							<Box
								sx={{
									display: "inline",
									color: "#42a5f5"
								}}
							>
								"What should I eat for dinner tonight?"
							</Box> or <Box
								sx={{
									display: "inline",
									color: "#42a5f5"
								}}
							>"Who is the best professor in UofT?"</Box>
						</Typography>
					</Container>
				</Box>
				<Container sx={{ py: 8 }} maxWidth="md">
					{this.state.accounts && (
						<Typography variant="h5" align="center" color="text.secondary" paragraph>
							<Button
								onClick={() => this.setState({ showType: "all" })}
							>
								Show All
							</Button>
							<Button
								onClick={() => this.setState({ showType: "participated" })}
							>
								Show Participated Post Only
							</Button>
							<Button
								onClick={() => this.setState({ showType: "unparticipated" })}
							>
								Show New Post
							</Button>
						</Typography>
					)}
					<Grid container spacing={4}>
						{allProposals.map((proposal) => (
							<Grid item key={proposal} xs={12} sm={6} md={4}>
								<Card
									sx={{ height: "100%", display: "flex", flexDirection: "column" }}
								>
									<CardContent sx={{ flexGrow: 1 }}>
										<Typography sx={{ textOverflow: "ellipsis", maxWidth: "230px" }} gutterBottom variant="h5" component="h2">
											{proposal.title}
										</Typography>
											{!proposal.canVote &&
												this.state.accounts &&
												<Chip sx={{ maxWidth: "210px" }} label="Participated" size="small" />}
										<Typography paragraph>
											"{proposal.content}"
										</Typography>
										<Typography sx={{ marginTop: 1 }}>
											<Chip sx={{ margin: 1, maxWidth: "210px" }} label={NAME_LABEL_MAPPING[proposal.type]} size="small" />
											<Chip sx={{ margin: 1, maxWidth: "210px" }} label={NAME_LABEL_MAPPING[proposal.strategy]} size="small" />
										</Typography>
									</CardContent>
									<CardActions>
										<Button
											size="small" onClick={() => this.setState({ voteModal: proposal })}
											disabled={!this.state.accounts}
										>
											Vote
										</Button>
									</CardActions>
								</Card>
							</Grid>
						))}
					</Grid>
				</Container>
				<PostModal
					open={this.state.createModalOpen}
					close={() => this.setState({ createModalOpen: false })}
					web3={this.state.web3}
					submit={(value) => {
						this._createContract(value);
					}}
				/>
				<VoteModal
					data={this.state.voteModal}
					web3={this.state.web3}
					account={this.state.accounts && this.state.accounts[0]}
					contract={this.state.voteModal && contractMapping[this.state.voteModal.type][this.state.voteModal.strategy]}
					close={() => this.setState({ voteModal: null })}
					submit={async (value) => {
						try {
							const contract = contractMapping[this.state.voteModal.type][this.state.voteModal.strategy];
							await contract.methods.vote(this.state.voteModal.idx, value).send({ from: this.state.accounts[0], gas: 3000000 });
							this._getAll();
							this.setState({ voteModal: null });
						} catch (error) {
							// Catch any errors for any of the above operations.
							alert(
								`Failed to vote. Check console for details.`
							);
							console.error(error);
						}
					}}
				/>
			</ThemeProvider>
		);
	}
}

export default App;
