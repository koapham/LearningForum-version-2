import React, { Component } from 'react';
import { Form, Button, TextArea, Input, Message, Dropdown,
        Modal, Header, Segment, Icon, Divider, Label } from 'semantic-ui-react';
import Layout from '../../components/Layout';
import factory from '../../ethereum/factory';
import Profile from '../../ethereum/profile';
import web3 from '../../ethereum/web3';
import { getIpfsHash } from '../../utils/ipfs';

class QuestionNew extends Component {
    state = {
        questionTitle: '',
        description: '',
        deposit: '',
        maxDuration: '',
        errorMessage: '',
        successMessage: '',
        loading: false,
        disabled: false,
        popup: false,
        cropPopup: false,
        cropLoading: false,
        imageUrl: '',
        imageCropped: '',
        croppedPixels: null,
        buffer: null,
        crop: { x: 0, y: 0 },
        zoom: 1,
        files_array: [],
        fileHashes_array: [],
        fileNames_array: [],
        category: ''
    };


    onSubmit = async (event) => {
        event.preventDefault();

        const { category, questionTitle, description, deposit, maxDuration, fileHashes_array, fileNames_array} = this.state;


        this.setState({ loading: true, popup: false, errorMessage: '' });

        try{
            //const descBuf = Buffer.from(description, 'utf8');
            //const descHash = await getIpfsHash(descBuf);
            
            const accounts = await web3.eth.getAccounts();
            try {
                 await factory.methods.hasProfile(accounts[0]).call();}
            catch (err){
                throw Error("You have to be a user to post a question");}

            /*const profileAddress = await factory.methods.getProfile(accounts[0]).call();
            let profile = Profile(profileAddress);
            var token = Number(await profile.methods.getToken().call());
            console.log("Yes");
            if (Number(deposit)>token) {
                throw Error("You don't have enough tokens to deposit to the question");}*/
            await factory.methods
                .createQuestion(category,
                                questionTitle,
                                description,
                                //descHash.substring(2),
                                //web3.utils.toWei(deposit, 'ether'),
                                Number(deposit),
                                parseFloat(maxDuration) * 60 * 60,
                                fileHashes_array,
                                fileNames_array)
                .send({
                    from: accounts[0],
                });
                console.log("LOADINGGG " + this.state.loading)
            this.setState({ disabled: true, 
                successMessage: "You have submitted the question successfully" });
        } catch (err) {
            this.setState({ errorMessage: err.message });
        }
        console.log("LOADINGGG " + this.state.loading)
        this.setState({ loading: false });
    }


    renderFiles (elmFiles) {
        let {files_array} = this.state;

        if (files_array.length == 0) {
            return(
                <Segment placeholder>
                    <Header icon>
                    <Icon name='images outline' />
                        No files are uploaded for this question.
                    </Header>
                    <input 
                        style={{ display: 'none' }} 
                        type='file' 
                        onChange={() => this.onFileSelected1()}
                        ref={fileInput => this.fileInput = fileInput}/>
                    <Button primary onClick={() => this.fileInput.click()}>Upload Files</Button>
                </Segment> 
            );
        } else {
            return(
                <Segment placeholder>
                    <center>
                        <div style={{marginBottom: '20px'}}>
                            {elmFiles}
                        </div>
        
                        <input 
                            style={{ display: 'none' }} 
                            type='file' 
                            onChange={() => this.onFileSelected1()}
                            ref={fileInput => this.fileInput = fileInput}/>
                        <Button primary onClick={() => this.fileInput.click()}>Upload Files</Button>
                    </center>
                </Segment> 
            );
        }
    }

    onFileSelected1 = async () => {

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

                console.log("fileHashes_array: ", fileHashes_array);
            }

            reader.readAsDataURL(file);
        }
    }

    onFileRemoved1 = (file) => {
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


    render() {

        let {files_array} = this.state;
        let elmFiles = null;
        if (files_array !== null) {
            elmFiles = files_array.map((item, index) =>
                <Label as='a' key={index} size='big'>
                    {item.name}
                    <Icon name='delete' 
                    onClick={() => this.onFileRemoved1(item)} />
                </Label>
            );
        }

        const tagOptions = [
            {
                key: 'CS Introduction',
                text: 'CS Introduction',
                value: 'CS Introduction',
                label: { color: 'red', empty: true, circular: true },
            },
            {
                key: 'Data Structures',
                text: 'Data Structures',
                value: 'Data Structures',
                label: { color: 'blue', empty: true, circular: true },
            },
            {
                key: 'Algorithms',
                text: 'Algorithms',
                value: 'Algorithms',
                label: { color: 'green', empty: true, circular: true },
            },
            {
                key: 'Machine Learning',
                text: 'Machine Learning',
                value: 'Machine Learning',
                label: { color: 'yellow', empty: true, circular: true },
            },
            {
                key: 'Blockchain',
                text: 'Blockchain',
                value: 'Blockchain',
                label: { color: 'grey', empty: true, circular: true },
            }
          ]

        console.log("this.state.category: ", this.state.category);
        
        return (
            <Layout>
                <h3>Post a question</h3>
                <Form error={!!this.state.errorMessage} success={!!this.state.successMessage}>
                    <Form.Field>
                        <label>Category</label>
                        <Dropdown placeholder='Choose one ...'
                                  openOnFocus
                                  selection
                                  options={tagOptions}
                                  onChange={event => this.setState({ category: event.target.textContent })}>
                        </Dropdown>
                    </Form.Field>
                    <Form.Field>
                        <label>Title</label>
                        <Input 
                            placeholder="Enter Title"
                            value={this.state.questionTitle}
                            onChange={event => this.setState({ questionTitle: event.target.value })}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Question Description</label>
                        <TextArea 
                            placeholder="Enter Description"
                            value={this.state.description}
                            onChange={event => this.setState({ description: event.target.value })}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Ether</label>
                        <Input 
                            label="ether" 
                            labelPosition="right"
                            value={this.state.deposit}
                            onChange={event => this.setState({ deposit: event.target.value })}
                        />
                    </Form.Field>
                    <Form.Field>
                        <label>Maximum Duration</label>
                        <Input 
                            label="hour(s)" 
                            labelPosition="right"
                            value={this.state.maxDuration}
                            onChange={event => this.setState({ maxDuration: event.target.value })}
                        />
                    </Form.Field>
                    <Form.Field>
                        {this.renderFiles(elmFiles)}
                    </Form.Field>
                    <Button loading={this.state.loading} primary disabled={this.state.disabled} onClick={() => this.setState({ popup: true })}>Post Your Question</Button>
                    <Message error header="Oops! Something went wrong" content={this.state.errorMessage} />
                    <Message success header="Success!" content={this.state.successMessage} />
                </Form>

                <Divider hidden />

                <Modal
                    size="small"
                    open={this.state.popup}
                    onClose={() => this.setState({ popup: false })}
                >
                    <Modal.Header>Do you want to publish this question?</Modal.Header>
                    <Modal.Content>
                        <p>
                            Published item will be displayed on the homepage.
                        </p>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={() => this.setState({ popup: false })}>
                            <Icon name='cancel' />
                            Cancel
                        </Button>
                        <Button positive onClick={(e) => this.onSubmit(e)}>
                            <Icon name='upload' />
                            Submit and Publish Now
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Layout>
        );
    }
}

export default QuestionNew;
