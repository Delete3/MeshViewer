import 'primereact/resources/primereact.css'
import './style.scss';

import React, { useEffect, useRef, useReducer, useState } from 'react';
import { ConfigProvider, Spin } from 'antd';
import { useUpdateEffect } from '../utils/tool/UseUpdateEffect';

import UploadModal from './float/UploadModal';

import Editor from '../utils/Editor';
import AxesHelper from '../utils/function/AxesHelper';

const MeshViewer = props => {
    const containerRef = useRef();
    const [, forceRerender] = useReducer(x => x + 1, 0);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingTip, setLoadingTip] = useState('');

    useUpdateEffect(() => {
        if (!containerRef.current) return;

        Editor.setEditor(containerRef.current);
        AxesHelper.enableAxesHelper = true;
    }, []);

    //可做切剖面、”網格擴散“功能
    return <ConfigProvider
        theme={{
            token: {
                colorPrimary: '#00b96b',
                colorBgContainer: '#f6ffed'
            }
        }}
    >
        <Spin
            wrapperClassName='spin-main-container'
            spinning={isLoading}
            tip={loadingTip}
        >
            <UploadModal />
            <div
                ref={containerRef}
                className='editor'
            />
        </Spin>
    </ConfigProvider>
}

export default MeshViewer;