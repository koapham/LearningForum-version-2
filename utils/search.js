import Question from '../ethereum/question';
import {getString} from './ipfs';
import factory from '../ethereum/factory';
const Fuse = require("fuse.js");
async function search(value, questions){
    let list = [];
    for (let i=0;i<questions.length;i++){
        var summary = await Question(questions[i]).methods.getSummary().call();
        list.push({'address':questions[i],'title':summary[0],'description':summary[1]});//await getString('Qm'+summary[1])});
    }
    let options = {
        id:"address",
        threshold:0.1,
        shouldSort: true,
        tokenize: true,
        keys: [{
            name:'title',
            weight:0.7
        },{
            name:'description',
            weight: 0.3
        }]
    }
    let fuse = new Fuse(list,options);
    const result = fuse.search(value);
    console.log(result);
    /*let result=[];
    for (let i =0;i<resultDict.length;i++){
        result.push(resultDict[i]['address']);
    }*/
    return result;
}
export{search};
