// APS 1050 PROJECT
// D-VOTING
// YANGFAN LI
// 1003152982

import React, { Component } from "react";

import {
	Modal,
	Divider,
	Typography,
	Box,
	Chip,
	Button,
	FormControl,
	FormControlLabel,
	FormLabel,
	RadioGroup,
	Radio,
	LinearProgress,
	Alert
} from "@mui/material";

import "./VoteModal.css";

const NAME_LABEL_MAPPING = {
	"evenly": "Voting Power Evenly Distributed",
	"simple": "Everyone Can Vote",
	"min-balance": "Minimum Balance Required",
	"tex-time": "First Transaction Required Before Certain Time",
	"balance": "Voting Power Based On Balance"
};

class VoteModal extends Component {
	state = {
		option: null,
		meetRequirnment: true,
		loading: true,
		text: ""
	};

	componentDidUpdate(prevProps) {
		if (!this.props.data && prevProps.data) {
			this.setState({
				option: null,
				meetRequirnment: true,
				text: ""
			});
		}
		if (!prevProps.data && this.props.data && this.props.data.canVote) {
			this.setState({
				text: "Checking your eligibility...",
				loading: true
			}, this._loadStrategy);
		}
	}

	_loadStrategy = async () => {
		let text = "";
		if (this.props.data.strategy === "min-balance") {
			const accBalance = parseInt(await this.props.web3.eth.getBalance(this.props.account));
			if (!this.props.contract) {
				this.setState({ loading: false });
				return;
			}
			const requiredBalance = await this.props.contract.methods.min_balance(this.props.data.idx).call();
			if (accBalance < parseInt(requiredBalance)) {
				this.setState({
					meetRequirnment: false
				});
				text = `You are not eligible to vote. The minimal required account balance for this porposal is ${this.props.web3.utils.fromWei(requiredBalance)} ETH.`
			}
		} else if (this.props.data.strategy === "tex-time") {
			const accFirstTrans = await this._getFirstTrans();
			if (!this.props.contract) {
				this.setState({ loading: false });
				return;
			}
			const requiredBefore = parseInt(await this.props.contract.methods.block_required(this.props.data.idx).call());
			if (!accFirstTrans || accFirstTrans > requiredBefore) {
				const block = new Date((await this.props.web3.eth.getBlock(requiredBefore)).timestamp * 1000);
				this.setState({
					meetRequirnment: false
				});
				text = `You are not eligible to vote. The account first transaction made needs to be before ${block.toLocaleString("en-US")}.`
			}
		}
		this.setState({ loading: false, text });
	}

	_getFirstTrans = async () => {
		const myAddr = this.props.account;
		const latestBlock = await this.props.web3.eth.getBlockNumber();
		for (let i=0; i<=latestBlock; i++) {
			const block = await this.props.web3.eth.getBlock(i);
			if (block && block.transactions) {
				for (let t of block.transactions) {
					const transBody = await this.props.web3.eth.getTransaction(t);
					if (myAddr === transBody.from || myAddr === transBody.to) {
						return i;
					}
				}
			}
		}
	}

	_renderOptions = () => {
		return (
			<FormControl component="fieldset">
				<RadioGroup
					aria-label="weight"
					name="row-radio-buttons-group"
					value={this.state.option}
					onChange={(evt) => this.setState({ option: evt.target.value })}
				>
					{this.props.data.options.split(",").map((op) =>
						<FormControlLabel
							value={op}
							label={op}
							control={<Radio />} 
						/>
					)}
				</RadioGroup>
			</FormControl>
		);
	};

	_renderResults = () => {
		const counts = [
			parseInt(this.props.data.option1count1),
			parseInt(this.props.data.option1count2),
			parseInt(this.props.data.option1count3)
		];

		const total = counts.reduce((partial_sum, a) => partial_sum + a, 0);

		return (
			<>
				<Box
					sx={{ zIndex: 1000, marginTop: 1, marginLeft: 1, fontWeight: "bold" }}
				>
					{`Number of votes: ${this.props.data.vote_count}`}
				</Box>
				{this.props.data.options.split(",").map((op, idx) => (
					<>
						<Box
							sx={{ zIndex: 1000, marginTop: 1, marginLeft: 1, fontWeight: "bold" }}
						>
							{op}
						</Box>
						<Box sx={{ display: "flex", alignItems: "center" }}>
							<Box sx={{ width: "100%", mr: 1 }}>
								<LinearProgress
									sx={{ height: "20px" }}
									variant="determinate"
									color="inherit"
									value={(counts[idx] / total) * 100}
								/>
							</Box>
							<Box sx={{ minWidth: 35 }}>
								<Typography variant="body2" color="text.secondary">{`${Math.round(
									(counts[idx] / total) * 100
								)}%`}</Typography>
							</Box>
						</Box>
					</>
				))}
			</>
		);
	};

	render() {
		if (!this.props.data) {
			return null;
		}

		return (
			<Modal
				open={this.props.data}
				onClose={this.props.close}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>
				<Box sx={{
					position: "absolute",
					top: "50%",
					left: "50%",
					transform: "translate(-50%, -50%)",
					width: 800,
					bgcolor: "background.paper",
					border: "2px solid #000",
					boxShadow: 24,
					p: 4,
					}}
				>
					<Typography id="modal-modal-title" variant="h6" component="h2">
						{this.props.data.title}
					</Typography>
					<Divider>Content</Divider>
					<Typography id="modal-modal-description" sx={{ mt: 2 }}>
						<FormLabel
							component="legend"
							sx={{
								marginTop: 2
							}}
						>
							{this.props.data.content}
						</FormLabel>
					</Typography>
					<Divider>{this.props.data.canVote ? "Options" : "Result"}</Divider>
					{this.state.text && <Alert severity="warning">{this.state.text}</Alert>}
					{this.props.data.canVote ? this._renderOptions() : this._renderResults()}
					<Divider sx={{ marginTop: 1 }}>Strategy</Divider>
					<Chip sx={{ marginRight: 1 }} label={NAME_LABEL_MAPPING[this.props.data.type]} size="small" />
					<Chip label={NAME_LABEL_MAPPING[this.props.data.strategy]} size="small" />
					<Typography
						sx={{ display: "flex", justifyContent: "flex-end" }}
						id="modal-footer"
						variant="h6"
						component="h2"
					>
						<Button variant="text" onClick={this.props.close}>
							Close
						</Button>
						{this.props.data.canVote && (
							<Button
								sx={{ m: 1 }}
								variant="text"
								onClick={() => {
									this.props.submit(this.props.data.options.split(",").findIndex((val) => val === this.state.option));
								}}
								disabled={!this.state.option || !this.state.meetRequirnment || this.state.loading}
							>
								Vote
							</Button>
						)}
					</Typography>
				</Box>
			</Modal>
		);
	}
}

export default VoteModal;
