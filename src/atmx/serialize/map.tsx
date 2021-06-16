import { Element, Node } from 'slate';
import { Serializer } from "./";



const serializeMap: Array<(arg0: Serializer) => any> = [
    /*TODO  在一个paragraph中的text合并*/

    (serializer) => {

        const marks = [
            ['bold', '**'],
            ['italic', '//'],
            ['deleted','--'],
            ['underline','__']
        ]

        for (let [mark, before, after = before] of marks) {
            serializer.join({
                match: mark,
                action: (t, range) => serializer.wrap({
                    range,
                    value: [before, after],
                    priortity: 4
                })
            })
        }
    }
]

export default serializeMap