import escapeHtml from 'escape-html'
import { Node, Text } from 'slate'

const serializeText = node=>{
    const text = [node.text]
    if (node.hasOwnProperty('url')) {
        text[0] = `[${node.url} ${node.text}]`;
    }


    if (node.hasOwnProperty('bold')) {
        text.unshift("**");
        text.push('**');
    }
    if (node.hasOwnProperty('italic')) {
        text.unshift("//");
        text.push('//');
    }
    if (node.hasOwnProperty('underline')) {
        text.unshift("__");
        text.push('__');
    }
    if (node.hasOwnProperty('deleted')) {
        text.unshift("--");
        text.push('--');
    }

    return escapeHtml(text.join(''))
}



const serializeNode = node => {
    if (Text.isText(node)) {
        return serializeText(node)
    }

    const children = node.children.map(n => serializeNode(n)).join('')

    switch (node.type) {
        case 'quote':
            return `<blockquote><p>${children}</p></blockquote>`
        case 'paragraph':
            return `<p>${children}</p>`
        case 'header-one':
            return `<p>+ ${children}</p>`
        case 'header-two':
            return `<p>++ ${children}</p>`
        case 'header-three':
            return `<p>+++ ${children}</p>`
        default:
            return `${children}`
    }
}

const serialize = node => {
    let output = serializeNode(node);

    //去除重复符号
    //\*{4}|\/{4}|\-{4}|\_{4}
    let symbols = '*/-_'.split('').map(value =>
        `\\${value}{4}`
    ).join('|')
    symbols = `${symbols}`
    let flag =new RegExp(symbols,'g')
    while (flag.test(output)){
        output = output.replace(flag,'')
    }

    console.log(output)

    return output
}

export default serialize;