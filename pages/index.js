import React, { Component } from 'react';
import {Statistic, Divider, Grid, Table, Message, Rating, Icon, Button,
         Menu, Container, Segment} from 'semantic-ui-react';
import { ethers } from 'ethers';
import factory from '../ethereum/factory';
import Question from '../ethereum/question';
import Layout from '../components/Layout';
import { Router } from '../routes';
import moment from 'moment';
import web3 from '../ethereum/web3';
import {search} from '../utils/search';

class QuestionIndex extends Component {
    state = {
        loadingShareToken: false,
        disabledShareToken: false,
        didShareToken: false,
        currentIndex: 0,
        activeCategory: 'CS Introduction',
        availableQuestions: [],
        titles: [], 
        deposit: [], 
        timeEnd: [], 
        answererList: [],
        questionRating: [],
        isOverDue: [],
        shareToken: [],
        numAnswer4: [],
        deployedAsking: [],
        deployedQuery: [],
        deployedDiscussion: []
    }

    static async getInitialProps({ req, query }) { 
        
        let deployedQuestions = await factory.methods.getDeployedQuestions().call();
        deployedQuestions.reverse();
        
        //let chosenQuestions;
        console.log(query.value);
        let deployedCat1 = [];
        let deployedCat2 = [];
        let deployedCat3 = [];
        let deployedCat4 = [];
        let deployedCat5 = [];
        let deployed =[];
        let searchOrNot = false;
        let searchItem;
        //filter the questions based on search value
        if (query.value != undefined && query.value != 'favicon.ico') {
            searchItem = decodeURIComponent(query.value.substring(7));
            deployedQuestions = await search(searchItem,deployedQuestions);
        }
        
        await Promise.all(
            deployedQuestions.map(async (item) => {
                const itemCat = await Question(item).methods.getCategory().call();
                console.log(itemCat);
                switch (itemCat) {
                    case "CS Introduction":   {
                        deployedCat1.push(item);
                        break;
                    }   
                    case "Data Structures": {
                        deployedCat2.push(item);
                        break;
                    }   
                    case "Algorithms":  {
                        deployedCat3.push(item);
                        break;
                    }   
                    case "Machine Learning":  {
                        deployedCat4.push(item);
                        break;
                    } 
                    case "Blockchain":  {
                        deployedCat5.push(item);
                        break;
                    } 
                }
                console.log("deployedCat1: ", deployedCat1);
                console.log("deployedCat2: ", deployedCat2);
                console.log("deployedCat3: ", deployedCat3);
                console.log("deployedCat4: ", deployedCat4);
                console.log("deployedCat5: ", deployedCat5);
            }))
        return {deployedCat1, deployedCat2, deployedCat3, deployedCat4, deployedCat5, searchItem};
    }

    componentDidMount = async () => {
        // const deployedQuestions = await factory.methods.getDeployedQuestions().call();
        // deployedQuestions.reverse();
        
        // let {deployedAsking, deployedQuery, deployedDiscussion} = this.state;

        // console.log("deployedQuestions: ", deployedQuestions);

        // await Promise.all(
        //     deployedQuestions.map(async (item) => {
        //         const itemCat = await Question(item).methods.getCategory().call();
        //         console.log(itemCat);
        //         switch (itemCat) {
        //             case "Asking":   {
        //                 deployedAsking.push(item);
        //                 break;
        //             }   
        //             case "Query": {
        //                 deployedQuery.push(item);
        //                 break;
        //             }   
        //             case "Discussion":  {
        //                 deployedDiscussion.push(item);
        //                 break;
        //             }   
        //         }
        //         console.log("deployedAsking: ", deployedAsking);
        //         console.log("deployedQuery: ", deployedQuery);
        //         console.log("deployedDiscussion: ", deployedDiscussion);
        //     }));

        // await this.setState({
        //     deployedAsking: deployedAsking,
        //     deployedQuery: deployedQuery,
        //     deployedDiscussion: deployedDiscussion
        // });

        await this.renderData("CS Introduction");

        console.log("componentDidMount");
    }

    componentDidUpdate = async (prevProps) =>{
        if (prevProps.searchItem != this.props.searchItem){
        await this.renderData(this.state.activeCategory);
        console.log("componentDidUpdate");}
    }

    renderData = async (category) => {
        const {deployedCat1, deployedCat2, deployedCat3, deployedCat4, deployedCat5} = this.props;

        console.log("deployedCat1: ", deployedCat1);
        console.log("deployedCat2: ", deployedCat2);
        console.log("deployedCat3: ", deployedCat3);
        console.log("deployedCat4: ", deployedCat4);
        console.log("deployedCat5: ", deployedCat5);

        let availableQuestions = [];

        switch (category) { 
            case "CS Introduction": {
                availableQuestions = deployedCat1;
                break;
            }   
            case "Data Structures": {
                availableQuestions = deployedCat2;
                break;
            }   
            case "Algorithms": {
                availableQuestions = deployedCat3;
                break;
            }  
            case "Machine Learning": {
                availableQuestions = deployedCat4;
                break;
            } 
            case "Blockchain": {
                availableQuestions = deployedCat5;
                break;
            } 
        }
        console.log("availableQuestions: ", availableQuestions);

        let titles = [];
        let deposit = [];


        const summary = await Promise.all(
            availableQuestions
                .map((address) => {
                    return Question(address).methods.getSummary().call();
                })  
        );

        summary.forEach(function(item){
            titles.push(item[0]);
            deposit.push(item[2]);
        });


        const isOverDue = await Promise.all(
            availableQuestions.map((address)=>{
                return Question(address).methods.isOverdue().call();
            })
        );

        const timeArray = await Promise.all(
            availableQuestions.map((address)=>{
                return Question(address).methods.getTime().call();
            })
        );
        
        const timeEnd = timeArray.map((time)=>
            {return moment.unix(parseInt(time[0]) + parseInt(time[2])).format('dddd, Do MMMM YYYY, h:mm:ss a')});

        const answererList = await Promise.all(
            availableQuestions.map((address)=>{
                return Question(address).methods.getAnswerList().call();
            })
        );

        const shareToken = await Promise.all(
            availableQuestions.map((address)=>{
                return Question(address).methods.getCheckShareToken().call();
            })
        )

        const numAnswer4 = await Promise.all(
            availableQuestions.map((address)=>{
                return Question(address).methods.getNumAnswer4().call();
            })
        )

        const questionRating = await Promise.all(
            availableQuestions.map((address) => {
                return Question(address).methods.getRatingQuestion().call();
            })
        );

        this.setState({
            availableQuestions: availableQuestions,
            titles: titles, 
            deposit: deposit, 
            timeEnd: timeEnd, 
            answererList: answererList,
            questionRating: questionRating,
            isOverDue: isOverDue,
            shareToken: shareToken,
            numAnswer4: numAnswer4
        });
    }

    shareToken = async(event, address, index) =>{
        event.preventDefault();

        this.setState({ loadingShareToken: true, currentIndex: index});
        const accounts = await web3.eth.getAccounts();
        await factory.methods.shareTokenAt(address).send({
            from: accounts[0],
        });

        this.setState({ loadingShareToken: false, 
                        disabledShareToken: true
                    });

        console.log("Share!!!");
    }

    handleCategoryClick = async (e, { name }) => {
        await this.setState({ 
            activeCategory: name
        });
        const {activeCategory} = this.state;
        this.renderData(activeCategory);
        console.log("End handleCategoryClick");
    }

    renderRentsDesktop() {
        const {activeCategory} = this.state;

        const items = this.state.availableQuestions.map((address, i) => {
            const deposit = ethers.utils.formatUnits(this.state.deposit[i], "ether")*1000000000000000000;
            const rating = this.state.questionRating[i];
            const answers = this.state.answererList[i];
            const isOverDue = this.state.isOverDue[i];
            const canShareToken = this.state.shareToken[i];
            const timeEnd = this.state.timeEnd[i];
            const numAnswer4 = this.state.numAnswer4[i];
            console.log(canShareToken);
            return <Table.Row key={i}>
                <Table.Cell textAlign='center' width={2}>
                    <Statistic size='mini' color='red'>
                        <Statistic.Value><span 
                                            style={{fontSize: 15, color: '#6A737C'}}><Rating icon='star' size='huge' 
                                            rating={rating}
                                            maxRating={5} disabled />
                                        </span></Statistic.Value>
                        <Statistic.Label><span style={{fontSize: 15, color: '#6A737C'}}>votes</span></Statistic.Label>
                    </Statistic>
                </Table.Cell>
                <Table.Cell textAlign='center' width={2}>
                    <Statistic size='mini' color='red'>
                        <Statistic.Value><span style={{fontSize: 15, color: '#6A737C'}}>{answers.length}</span></Statistic.Value>
                        <Statistic.Label><span style={{fontSize: 15, color: '#6A737C'}}>answers</span></Statistic.Label>
                    </Statistic>
                </Table.Cell>
                <Table.Cell textAlign='center' width={2}>
                    <Statistic size='mini' color='red'>
                        <Statistic.Value><span style={{fontSize: 15, color: '#6A737C'}}>{deposit}</span></Statistic.Value>
                        <Statistic.Label><span style={{fontSize: 15, color: '#6A737C'}}>ethers</span></Statistic.Label>
                    </Statistic>
                </Table.Cell>
                <Table.Cell textAlign='left'>
                    <Grid.Row textAlign='left'>
                        <span style={{fontSize: 18, color: '#6A737C', cursor: 'pointer'}} onClick={() => Router.pushRoute(`/questions/${address}`)}><a>{this.state.titles[i]}</a></span></Grid.Row>
                    {isOverDue ? 
                    ((canShareToken) ? ((numAnswer4) ?
                    <Grid.Row textAlign='right'>
                        <Button positive onClick={(e)=>this.shareToken(e, address, i)}  loading={this.state.loadingShareToken&&(this.state.currentIndex==i)} disabled={this.state.disabledShareToken}>
                                 Share Tokens!
                        </Button>
                        <Message color='red' compact size='mini'
                            header={'End time: '+timeEnd}
                        />
                    </Grid.Row> : <Grid.Row textAlign='right'> <span>No answers more than 4 stars</span></Grid.Row>) : <Grid.Row textAlign='right'><span>Tokens Shared!<Icon name='check' color='green'/></span></Grid.Row>) :
                    <Grid.Row textAlign='right'>
                    <Message color='yellow' compact size='mini'
                        header={'End time: '+timeEnd}
                    />
                </Grid.Row>} 
                </Table.Cell> 
            </Table.Row>
        });

        return ( 
            <Container>
                <Menu tabular color={'green'}>
                    <Menu.Item name='CS Introduction' active={activeCategory === 'CS Introduction'} 
                                style={{fontSize:"18px"}}
                                onClick={this.handleCategoryClick} />
                    <Menu.Item name='Data Structures' active={activeCategory === 'Data Structures'} 
                                style={{fontSize:"18px"}}
                                onClick={this.handleCategoryClick} />
                    <Menu.Item name='Algorithms' active={activeCategory === 'Algorithms'} 
                                style={{fontSize:"18px"}}
                                onClick={this.handleCategoryClick} />
                    <Menu.Item name='Machine Learning' active={activeCategory === 'Machine Learning'} 
                                style={{fontSize:"18px"}}
                                onClick={this.handleCategoryClick} />
                    <Menu.Item name='Blockchain' active={activeCategory === 'Blockchain'} 
                                style={{fontSize:"18px"}}
                                onClick={this.handleCategoryClick} />
                </Menu>
                <Table>
                    <Table.Body>
                        {items}
                    </Table.Body>
                </Table>
            </Container>
        )
    }

    render() {
        const itemsLength = this.state.availableQuestions? this.state.availableQuestions.length : 0;
        console.log("render() ");
        return(
            <Layout searchItem = {this.props.searchItem} >
                
                <h2>Questions</h2>
                <Divider hidden/>

                {this.renderRentsDesktop()}

                <Divider hidden/>
                <div style={{ marginTop: 20 }}>Found {itemsLength} Item(s).</div>
                <Divider hidden/>
            </Layout>
        );
    }
}

export default QuestionIndex;
