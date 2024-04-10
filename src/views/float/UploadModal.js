import './style.scss';

import React, { useEffect, useState } from 'react';
import { useUpdateEffect } from '../../utils/tool/UseUpdateEffect';
import { Upload, Modal, theme } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import _ from 'lodash';
import axios from 'axios';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'

import Editor from '../../utils/Editor';

const { useToken } = theme;

const UploadModal = props => {
    const { token } = useToken();
    const [isModalOpen, setIsModalOpen] = useState(false);

    /**
     * @param {THREE.BufferGeometry} geometry 
     */
    const addModel = geometry => {
        geometry.deleteAttribute('normal');
        geometry.computeVertexNormals()
        const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            roughness: 0.2,
            side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);
        console.log(mesh)
        Editor.scene.add(mesh);
        Editor.renderOnce();
    }

    const onChange = async info => {
        const fileStatus = _.get(info, 'file.status', null);
        if (fileStatus != 'done') return;

        /**@type {File} */
        const originFileObj = _.get(info, 'file.originFileObj', null);
        if (!originFileObj) return;

        setIsModalOpen(false);

        const arrayBuffer = await originFileObj.arrayBuffer();
        const bufferGeometry = new STLLoader().parse(arrayBuffer);
        addModel(bufferGeometry);
    }

    useUpdateEffect(async () => {
        setIsModalOpen(false);
        const res = await axios.get('assets/models/Easterfrog.stl', { responseType: 'arraybuffer' });
        // const res = await axios.get('assets/models/lower.stl', { responseType: 'arraybuffer' });
        const bufferGeometry = new STLLoader().parse(res.data);
        addModel(bufferGeometry);
    }, []);

    return <Modal
        className='upload-modal'
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        maskClosable={false}
        closable={false}
        footer={null}
    >
        <Upload.Dragger
            className='upload-dragger'
            accept='.stl'
            onChange={onChange}
            customRequest={e => e.onSuccess()}
            showUploadList={false}
        >
            <InboxOutlined
                style={{ color: token.colorPrimary }}
                className='drag-icon'
            />
            <p>Click or drag file to this area to upload</p>
        </Upload.Dragger>
    </Modal>
}

export default UploadModal;