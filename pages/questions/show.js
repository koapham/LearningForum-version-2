import React, { Component } from 'react';
import {
    Form, 
    Button, 
    Header, 
    Icon, 
    Segment, 
    Divider, 
    Rating, 
    Label,
    Modal,
    Comment,
    Container,
    Table,
    Popup
} from 'semantic-ui-react';
import moment from 'moment';
import { ethers } from 'ethers';
import Layout from '../../components/Layout';
import factory from '../../ethereum/factory';
import Question from '../../ethereum/question';
// import Profile from '../../ethereum/profile';
import web3 from '../../ethereum/web3';
// import { Link, Router } from '../../routes';
import { getString, getIpfsHash } from '../../utils/ipfs';
import Countdown from 'react-countdown-now';


class QuestionShow extends Component {

    state = {
        loading: true,
        loadingFile: false,
        buffer: null,
        fileUrl: '',
        reply: '',
        files_array: [],
        fileHashes_array: [],
        answerList: [],
        replyText_arr: [],
        fileNames_array: [],
        popUpRating: false,
        popUpReply: false,
        popUpRatingQuestion: false,
        errorMessageRatingQuestion: '',
        successMessageRatingQuestion: '',
        loadingRatingQuestion: false,
        disabledRatingQuestion: false,
        popUpRatingAnswer: false,
        loadingRatingAnswer: false,
        errorMessageRatingAnswer: '',
        disabledRatingAnswer: false,
        rating: 0, //current rating
        submitRate: false, //for question,
        submitRateAnswer: false,
        totalRating: 0,
        totalDeposit: 0,
        totalRatingAnswer: 0,
        ratingAnswer: 0,
        currentIndexAnswer: -1,
        cannotRate: false,
        toggleChildRep: [],
        disabledMainReply: false
    };


    static async getInitialProps(props) {
        const question = Question(props.query.address);
        const summary = await question.methods.getSummary().call();
        const time = await question.methods.getTime().call();
        const profileOwner = await factory.methods.getProfile(summary[4]).call();
        const fileHashesQuestion = summary[5];
        const fileNamesQuestion = summary[6];
        const initialTotalRating = await question.methods.getRatingQuestion().call();
        const iconList = ['alligator', 'anteater', 'armadillo', 'auroch', 'axolotl',
        'badger', 'bat', 'beaver', 'buffalo', 'camel', 'capybara',
        'chameleon', 'cheetah', 'chinchilla', 'chipmunk', 'chupacabra',
        'cormorant', 'coyote', 'crow', 'dingo', 'dinosaur', 'dolphin',
        'duck', 'elephant', 'ferret', 'fox', 'frog', 'giraffe', 'gopher',
        'grizzly', 'hedgehog', 'hippo', 'hyena', 'ibex', 'ifrit', 'iguana',
        'jackal', 'kangaroo', 'koala', 'kraken', 'lemur', 'leopard',
        'liger', 'llama', 'manatee', 'mink', 'monkey', 'moose', 'narwhal',
        'orangutan', 'otter', 'panda', 'penguin', 'platypus',
        'pumpkin', 'python', 'quagga', 'rabbit', 'raccoon', 'rhino',
        'sheep', 'shrew', 'skunk', 'squirrel', 'tiger', 'turtle', 'walrus',
        'wolf', 'wolverine', 'wombat'];
        const avatarListIcon = iconList.map((item)=>{
            return 'https://ssl.gstatic.com/docs/common/profile/' + item + '_lg.png';
        });
        const avatarListName = iconList.map((item)=>{
            return 'anonymous ' + item;
        });
        const answerList = await question.methods.getAnswerList().call();
        let ratingAnswerList = [];
        var i;
        for (i=0; i<answerList.length; i++){
            ratingAnswerList.push(answerList[i].answerRate);
        }
        return { 
            address: props.query.address,
            questionTitle: summary[0],
            description: await getString('Qm'+summary[1]),
            initialDeposit: ethers.utils.formatUnits(summary[2], "ether"),
            //maxDuration: summary[3],
            owner: summary[4],
            time: time,
            profileOwner: profileOwner,
            initialTotalRating: initialTotalRating,
            avatarListIcon: avatarListIcon,
            avatarListName: avatarListName,
            ratingAnswerList: ratingAnswerList,
            fileHashesQuestion: fileHashesQuestion,
            fileNamesQuestion: fileNamesQuestion,
            maxDuration: (parseFloat(summary[3]) / 60 / 60).toFixed(2).toString(),
            publishTime: moment.unix(time[0]).format('dddd, Do MMMM YYYY, h:mm:ss a'),
            publishTimeMs: moment.unix(time[0]).valueOf(),
            maxDurationMs: moment.unix(time[2]).valueOf()
        };
    }

    async componentDidMount() {
        const question = Question(this.props.address);
        const answerList = await question.methods.getAnswerList().call();
        await this.setState({ answerList: answerList });

        let {replyText_arr, replyChildText_arr} = this.state;
        var i, j;
        if (answerList !== null) {
            for (i = 0 ; i < answerList.length ; i++) {
                let replyText = await getString('Qm'+answerList[i].replyHash)
                console.log("await getString('Qm'+item.replyHash)", replyText);
                replyText_arr.push(replyText);
            }
            this.setState({ 
                replyText_arr: replyText_arr,
                replyChildText_arr: replyChildText_arr 
            });
        }

        console.log("this.state.replyText_arr: ", this.state.replyText_arr);
        
        console.log("this.state.answerList: ", this.state.answerList);

        let toggleChildRep = new Array(answerList.length).fill(false);

        this.setState({ loading:false, toggleChildRep: toggleChildRep});

    }


    onSubmitRatingQuestion = async (event)=>{
        event.preventDefault();
        this.setState({ loadingRatingQuestion: true, errorMessageRatingQuestion: '' });
        const accounts = await web3.eth.getAccounts();
        await factory.methods.ratingQuestionAt(this.props.address, this.state.rating).send({
            from: accounts[0],
        });
        const myRating = await Question(this.props.address).methods.getRatingQuestion().call();
        const myDeposit = await Question(this.props.address).methods.getDeposit().call();

        this.setState({ totalDeposit: myDeposit,
                    totalRating: myRating,
                    submitRate: true ,
                    disabledRatingQuestion: true
                });

        this.setState({ loadingRatingQuestion: false ,
                        popUpRatingQuestion: false});
        console.log("hahaa");   
    }

    onSubmitRatingAnswer = async (event, index)=>{
        event.preventDefault();
        this.setState({ loadingRatingAnswer: true, errorMessageRatingAnswer: '' });
        const accounts = await web3.eth.getAccounts();
        const question = Question(this.props.address);
        const answerList = await question.methods.getAnswerList().call();
        
        if (accounts[0] != answerList[index].answerer){
            console.log("Not same")
            await factory.methods.ratingAnswerAt(this.props.address, this.state.ratingAnswer, index).send({
                from: accounts[0],
            });
            const myRating = await question.methods.getAnswerRate(index).call();
            this.setState({ 
                        totalRatingAnswer: myRating,
                        loadingRatingAnswer: false,
                        submitRateAnswer: true, 
                        popUpRatingAnswer: false ,
                        disabledRatingAnswer: true    
                    });
        }
        else {
            console.log("Same");
            this.setState({ cannotRate: true, 
                            loadingRatingAnswer: false,
                            popUpRatingAnswer: false,
                            disabledRatingAnswer: true });
        }

        console.log("hahaa");   
    }


    showFilesQuestion () {
        let {fileNamesQuestion, fileHashesQuestion} = this.props;

        if (fileNamesQuestion.length == 0) {
            return(
                <Segment placeholder>
                    <Header icon>
                    <Icon name='images outline' />
                        No files are uploaded for this question.
                    </Header>
                </Segment> 
            );
        } else {
            return(
                <Segment placeholder>
                    <center>
                        {fileNamesQuestion.map((fileName, index1) => 
                            <div style={{marginBottom: '10px'}}>
                                <Label as='a' size='big' href={"https://ipfs.io/ipfs/"+fileHashesQuestion[index1]}>
                                    <Icon name='download' />
                                    {fileName}
                                </Label>
                            </div>
                        )}   
                    </center>
                </Segment> 
            );
        }
    }

    showTitle() {
        const {questionTitle} = this.props;
        return (
                <Divider horizontal>
                    <Header as='h2'>
                        <Icon name='tag' />
                        {questionTitle}
                    </Header>
                </Divider>
        );
    }

    showQuestion() {
        const {
            description,
            maxDuration,
            publishTime,
            publishTimeMs,
            maxDurationMs
        } = this.props;

        const showRating = (this.state.submitRate ? this.state.totalRating : this.props.initialTotalRating)/1;
        const showDeposit = (this.state.submitRate ? this.state.totalDeposit: this.props.initialDeposit)*1000000000000000000;

        var currentTime = (new Date).getTime();
        let remainingTime = publishTimeMs + maxDurationMs - currentTime;
        if (remainingTime < 0) {
            remainingTime = 0;
        }

        return (
            <React.Fragment>
                <Table definition>
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell width={2}>Question</Table.Cell>
                            <Table.Cell style={{fontSize: '20px', lineHeight: '1.5'}}>
                                {description}
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Deposit (ETH)</Table.Cell>
                            <Table.Cell style={{fontSize: '20px'}}>{showDeposit}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Publish Time</Table.Cell>
                            <Table.Cell style={{fontSize: '20px'}}>{publishTime}</Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell>Duration (hours)</Table.Cell>
                            <Table.Cell style={{fontSize: '20px'}}>
                                <span style={{verticalAlign: 'middle', lineHeight: '33px'}}>
                                    {maxDuration}
                                </span>
                                {remainingTime > 0 
                                ? <Popup
                                    trigger={
                                        <Button style={{float: 'right', verticalAlign: 'middle'}}  
                                            icon='clock'
                                            color="violet"
                                        />}
                                    content={
                                        <span>
                                            <span>Remaining time - </span> 
                                            <Countdown date={Date.now() + remainingTime}>
                                            </Countdown>
                                        </span>}
                                    position='bottom right'
                                    inverted />
                                : <Popup
                                    trigger={
                                        <Button style={{float: 'right', verticalAlign: 'middle'}}  
                                            icon='clock'
                                            color="red"
                                        />
                                    }
                                    content={"EXPIRED"}
                                    position='bottom right'
                                    inverted />
                                }
                            </Table.Cell>
                        </Table.Row>
                        <Table.Row>
                            <Table.Cell><span onClick={() => this.setState({ popUpRatingQuestion: true })} style={{cursor: 'pointer', color: 'blue'}}>Vote</span></Table.Cell>
                            <Table.Cell><Rating icon='star' size='huge' rating={showRating} maxRating={5} disabled /></Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </React.Fragment>
        );
    }

    replyBox = (elmFiles, parent) => {
        return (
            <Form reply>
                <Form.TextArea 
                    placeholder="Enter Reply"
                    value={this.state.reply}
                    onChange={event => this.setState({ reply: event.target.value })}>
                        <div>
                            <Label as='a'>
                                Tag
                                <Icon name='delete' />
                            </Label>
                        </div>
                </Form.TextArea>
                <center disabled>
                    <div style={{marginBottom: '10px'}}>
                        {elmFiles}
                    </div>

                    <input 
                        style={{ display: 'none' }} 
                        type='file' 
                        onChange={() => this.onFileSelected()}
                        ref={fileInput => this.fileInput = fileInput}/>
                    <Button icon='file' onClick={() => this.fileInput.click()}></Button>
                    <Button content='Add Reply' labelPosition='left' icon='edit' primary 
                        onClick={(e) => this.onSubmitReply(e, parent)} />
                </center>
                <br />
            </Form>
        );
    }

    showChildAnswers = (parent) => {
        const {answerList, replyText_arr} = this.state;

        let elmChildren = null;
        if (answerList !== null) {
            elmChildren = answerList.map((item, index) => {
                return (
                    Number(item.parent) == Number(parent) ?
                        <span>
                            <Comment>
                                <Comment.Avatar src={this.props.avatarListIcon[index]} style={{backgroundColor: 'crimson'}} />
                                <Comment.Content>
                                    { <Comment.Author as='a'>{this.props.avatarListName[index]}</Comment.Author> }
                                    <Comment.Metadata>
                                        <div>
                                            {moment.unix(item.answerTime).format('dddd, Do MMMM YYYY, h:mm:ss a')}
                                        </div>
                                    </Comment.Metadata>
                                    <Comment.Text>
                                        {replyText_arr[index]}
                                    </Comment.Text>
                                    <Comment.Actions>
                                        <Comment.Action><span onClick={() => this.setState({ 
                                                                                            popUpRatingAnswer: true,
                                                                                            currentIndexAnswer: index
                                                                                            })}>Vote</span></Comment.Action>
                                        <Comment.Action><Rating icon='star' 
                                                            rating={((this.state.submitRateAnswer&&(this.state.currentIndexAnswer==index))? this.state.totalRatingAnswer: this.props.ratingAnswerList[index])/1}
                                                            maxRating={5} disabled /></Comment.Action>
                                        {item.fileNames.map((fileName, index1) => 
                                            <Label as='a' href={"https://ipfs.io/ipfs/"+item.fileHashes[index1]}>
                                                <Icon name='download' />
                                                {fileName}
                                            </Label>
                                        )}    
                                    </Comment.Actions>
                                </Comment.Content>
                            </Comment>
                        <br /> 
                    </span>
                    : null
                );
            });
        } 
        return (
            <span>
                {elmChildren}
            </span>
        );
    }

    handleToggleChildRep = (index) => {
        let {toggleChildRep, disabledMainReply} = this.state;
        let i;
        for (i = 0 ; i < toggleChildRep.length ; i++) {
            if (i == index)
                toggleChildRep[index] = !toggleChildRep[index];
            else
                toggleChildRep[i] = false;
        }

        if (toggleChildRep[index] == true)
            disabledMainReply = true;
        else
            disabledMainReply = false;

        this.setState({ 
            toggleChildRep: toggleChildRep,
            disabledMainReply: disabledMainReply,
            reply: '',
            files_array: [],
            fileNames_array: [],
            fileHashes_array: [] 
        });
    }

    enableMainReply = () => {
        const {answerList} = this.state;
        
        if (this.state.disabledMainReply) {
            this.setState({
                disabledMainReply: false,
                toggleChildRep: new Array(answerList.length).fill(false),
                reply: '',
                files_array: [],
                fileNames_array: [],
                fileHashes_array: []
            });
            console.log("enable");
        }
    }

    Comments = (elmFiles) => {

        const {answerList, replyText_arr, toggleChildRep} = this.state;

        let elmComments = null;
        if (answerList !== null) {
            elmComments = answerList.map((item, index) => {
                return (
                    item.parent == -1 ?
                        <span>
                            <Comment>
                                <Comment.Avatar src={this.props.avatarListIcon[index]} style={{backgroundColor: 'crimson'}} />
                                <Comment.Content>
                                    { <Comment.Author as='a'>{this.props.avatarListName[index]}</Comment.Author> }
                                    <Comment.Metadata>
                                        <div>
                                            {moment.unix(item.answerTime).format('dddd, Do MMMM YYYY, h:mm:ss a')}
                                        </div>
                                    </Comment.Metadata>
                                    <Comment.Text>
                                        {replyText_arr[index]}
                                    </Comment.Text>
                                    <Comment.Actions>
                                        <Comment.Action>
                                            {/* Reply */}
                                            <span onClick={() => this.handleToggleChildRep(index)}>
                                                {toggleChildRep[index] == false ? "Reply" : "Close"}
                                            </span>
                                        </Comment.Action>                                               
                                        <Comment.Action><span onClick={() => this.setState({ 
                                                                                            popUpRatingAnswer: true,
                                                                                            currentIndexAnswer: index
                                                                                            })}>Vote</span></Comment.Action>
                                        <Comment.Action><Rating icon='star' 
                                                            rating={((this.state.submitRateAnswer&&(this.state.currentIndexAnswer==index))? this.state.totalRatingAnswer: this.props.ratingAnswerList[index])/1}
                                                            maxRating={5} disabled /></Comment.Action>
                                        {item.fileNames.map((fileName, index1) => 
                                            <Label as='a' href={"https://ipfs.io/ipfs/"+item.fileHashes[index1]}>
                                                <Icon name='download' />
                                                {fileName}
                                            </Label>
                                        )}    
                                    </Comment.Actions>

                                    <br /> 
                                    {this.showChildAnswers(item.id)}
                                    {toggleChildRep[index] == true && this.replyBox(elmFiles, item.id)}
                                </Comment.Content>
                            </Comment> 
                    </span>
                    :null
                );
            });
        } 

        console.log("this.state.disabledMainReply: ", this.state.disabledMainReply);

        return (
        <Container>
        <Header as='h3' dividing>
            Comments
        </Header>
        <Comment.Group>     
          {elmComments}
        </Comment.Group>
        
        <Form reply onDoubleClick={() => this.enableMainReply()}>
            <Form.TextArea 
                disabled={this.state.disabledMainReply}
                placeholder="Enter Reply"
                value={this.state.disabledMainReply ? "" : this.state.reply}
                onChange={event => this.setState({ reply: event.target.value })}>
                    <div>
                        <Label as='a'>
                            Tag
                            <Icon name='delete' />
                        </Label>
                    </div>
            </Form.TextArea>
            <center>
                <div style={{marginBottom: '10px'}}>
                    {this.state.disabledMainReply ? null : elmFiles}
                </div>

                <input 
                    style={{ display: 'none' }} 
                    type='file' 
                    onChange={() => this.onFileSelected()}
                    ref={fileInput => this.fileInput = fileInput}/>
                <Button icon='file' 
                        disabled={this.state.disabledMainReply}
                        onClick={() => this.fileInput.click()}>
                </Button>
                <Button content='Add Reply' labelPosition='left' icon='edit' primary 
                        disabled={this.state.disabledMainReply}
                        onClick={(e) => this.onSubmitReply(e, -1)} />        {/* parent = -1 */}  
            </center>
        </Form>
        <Modal
            size="tiny"
            open={this.state.popUpRatingAnswer}
            onClose={() => this.setState({ popUpRatingAnswer: false })}
            style={{textAlign: 'center'}}
        >
            <Modal.Header>Rate this answer</Modal.Header>
            <Modal.Content>
                <span textAlign='center'><Rating onRate={(e, {rating} ) => this.setState({ratingAnswer: rating})} maxRating={5} icon='star' size='massive' /></span>
            </Modal.Content>
            <Modal.Actions>
                <Button negative onClick={() => this.setState({ popUpRatingAnswer: false })}>
                    <Icon name='remove' />
                    Cancel
                </Button>
                <Button positive onClick={(e) => this.onSubmitRatingAnswer(e,this.state.currentIndexAnswer)} loading={this.state.loadingRatingAnswer} 
                // 
                >
                    <Icon name='checkmark' />
                    Submit
                </Button>
            </Modal.Actions>
            </Modal>
        

        <Modal
            size="tiny"
            open={this.state.popUpRatingQuestion}
            onClose={() => this.setState({ popUpRatingQuestion: false })}
            style={{textAlign: 'center'}}
        >
            <Modal.Header>Rate this question</Modal.Header>
            <Modal.Content>
                <span textAlign='center'><Rating onRate={(e, {rating} ) => this.setState({rating})} maxRating={5} icon='star' size='massive' /></span>
            </Modal.Content>
            <Modal.Actions>
                <Button negative onClick={() => this.setState({ popUpRatingQuestion: false })}>
                    <Icon name='remove' />
                    Cancel
                </Button>
                <Button positive onClick={(e) => this.onSubmitRatingQuestion(e)}  loading={this.state.loadingRatingQuestion} 
                // disabled={this.state.disabledRatingQuestion}
                >
                    <Icon name='checkmark' />
                    Submit
                </Button>
            </Modal.Actions>
                </Modal>

        <Modal
            size="tiny"
            open={this.state.cannotRate}
            onClose={() => this.setState({ cannotRate: false })}
            style={{textAlign: 'center'}}
        >
            <Modal.Header>You cannot rate your own answer</Modal.Header>
                </Modal>
        </Container>
      );
    }

    onFileRemoved = (file) => {
        var i = 0;
        let {files_array, fileHashes_array, fileNames_array} = this.state;
        console.log('file: ', file);
        for (i = 0 ; i < files_array.length ; i++) {
            if (file === files_array[i]) {
                files_array.splice(i, 1);
                fileNames_array.splice(i, 1);
                fileHashes_array.splice(i, 1);
                break;
            } 
        }

        this.setState({ 
            files_array: files_array,
            fileNames_array: fileNames_array,
            fileHashes_array: fileHashes_array
        });
        console.log('fileNames_array', fileNames_array);
        console.log("fileHashes_array: ", fileHashes_array);
    }

    onFileSelected = async () => {

        const reader = new FileReader();

        const file = this.fileInput.files[0]; 
        
        if (file instanceof Blob ) {
            console.log(file);

            let {files_array, fileNames_array, fileHashes_array} = this.state;
            files_array.push(file);
            fileNames_array.push(file.name);
            this.setState({ 
                files_array: files_array, 
                fileNames_array: fileNames_array
            });

            console.log("fileNames_array: ", fileNames_array);

            reader.onloadend = async () => {
                await this.setState({
                    fileUrl: reader.result,
                    loadingFile: true,
                    buffer: Buffer.from(reader.result)
                });          
    
                const fileHash = this.state.buffer ? (await getIpfsHash(file)) : '0';
            
                fileHashes_array.push(fileHash);
                this.setState({ fileHashes_array: fileHashes_array });

                this.setState({ loadingFile: false });
                console.log("fileHashes_array: ", fileHashes_array);
            }

            reader.readAsDataURL(file);
        }
    }

    onSubmitReply = async (event, parent) => {
        event.preventDefault();

        let {fileHashes_array, reply, fileNames_array} = this.state;

        this.setState({ loading: true, errorMessage: '' });

        console.log(this.state.reply);

        try{
            const replyBuf = Buffer.from(reply, 'utf8');
            const replyHash = await getIpfsHash(replyBuf);
            const accounts = await web3.eth.getAccounts();
            await factory.methods
                .createAnswer(this.props.address,
                                replyHash.substring(2),
                                fileHashes_array,
                                fileNames_array,
                                parent)
                .send({      
                    from: accounts[0]
                });

            console.log("Done add reply!!!");
            const question = Question(this.props.address);
            const answerList = await question.methods.getAnswerList().call();
            this.setState({ answerList: answerList});
            
            //this.setState({replyText_arr: []});
            let {replyText_arr, toggleChildRep} = this.state;
            let newReplyText = await getString('Qm'+answerList[answerList.length - 1].replyHash);
            replyText_arr.push(newReplyText);
            toggleChildRep.push(false);
            // var i;
            // for (i = 0 ; i < answerList.length ; i++) {
            //     let replyText = await getString('Qm'+answerList[i].replyHash)
            //     replyText_arr.push(replyText);
            // }
            this.setState({ 
                replyText_arr: replyText_arr,
                toggleChildRep: toggleChildRep 
            });

            console.log("this.state.replyText_arr: ", this.state.replyText_arr);
            
            console.log("this.state.answerList: ", this.state.answerList);

            this.setState({
                reply: '',
                files_array: [],
                fileNames_array: [],
                fileHashes_array: []
            });
        
        } catch (err) {
            this.setState({ errorMessage: err.message });
            console.log('error happennnn');
            console.log('errorMessage: ', err.message);
        }
        this.setState({ loading: false });
    }

    render() {

        let {files_array} = this.state;
        let elmFiles = null;
        if (files_array !== null) {
            elmFiles = files_array.map((item, index) =>
                <Label as='a' key={index} >
                    {item.name}
                    <Icon name='delete' 
                    onClick={() => this.onFileRemoved(item)} />
                </Label>
            );
        }

        console.log("this.props.ratingAnswerList: ", this.props.ratingAnswerList);

        return(
            <Layout>

                {this.showTitle()}

                <Divider hidden/>

                {this.showFilesQuestion()}

                <Divider hidden/>

                {this.showQuestion()}

                <Divider hidden/>
                <Divider hidden/>

                {this.Comments(elmFiles)}

                <Divider hidden/>
            </Layout> 
        );
    }
}

export default QuestionShow;
