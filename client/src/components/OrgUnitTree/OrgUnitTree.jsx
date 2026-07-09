import React, { useMemo, useState } from 'react';
import { Input, Tree, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './style.css';

const renderNodeTitle = (node) => (
    <span className="org-tree-node">
        {node.code && <span className="org-tree-code">{node.code}</span>}
        <span className="org-tree-name">{node.name}</span>
    </span>
);

const mapToTreeData = (nodes = []) => {
    return nodes.map((node) => ({
        key: node._id || node.id,
        title: renderNodeTitle(node),
        data: node,
        disabled: node.isActive === false,
        children: node.children?.length ? mapToTreeData(node.children) : undefined,
    }));
};

const filterTree = (nodes, keyword) => {
    if (!keyword) return nodes;

    const lowerKeyword = keyword.toLowerCase();

    const walk = (items) => {
        return items
            .map((node) => {
                const searchText = [node.code, node.name]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                const children = node.children?.length ? walk(node.children) : [];
                const matched = searchText.includes(lowerKeyword) || children.length > 0;
                if (!matched) return null;
                return { ...node, children };
            })
            .filter(Boolean);
    };

    return walk(nodes);
};

export const OrgUnitTree = ({
    treeData = [],
    selectedKey,
    onSelect,
    showSearch = true,
    className = '',
}) => {
    const [searchValue, setSearchValue] = useState('');
    const [expandedKeys, setExpandedKeys] = useState([]);

    const filteredTree = useMemo(
        () => filterTree(treeData, searchValue.trim()),
        [treeData, searchValue]
    );

    const antTreeData = useMemo(() => mapToTreeData(filteredTree), [filteredTree]);

    const allKeys = useMemo(() => {
        const keys = [];
        const walk = (nodes) => {
            nodes.forEach((node) => {
                keys.push(node._id || node.id);
                if (node.children?.length) walk(node.children);
            });
        };
        walk(filteredTree);
        return keys;
    }, [filteredTree]);

    return (
        <div className={`org-tree-panel ${className}`}>
            {showSearch && (
                <Input
                    allowClear
                    prefix={<SearchOutlined style={{ color: '#94a3b8' }} />}
                    placeholder="Tìm đơn vị..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="org-tree-search"
                />
            )}
            {antTreeData.length === 0 ? (
                <Empty description="Chưa có đơn vị" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
                <div className="org-tree-scroll">
                    <Tree
                        showLine={{ showLeafIcon: false }}
                        blockNode
                        treeData={antTreeData}
                        selectedKeys={selectedKey ? [selectedKey] : []}
                        expandedKeys={expandedKeys.length ? expandedKeys : allKeys.slice(0, 3)}
                        onExpand={(keys) => setExpandedKeys(keys)}
                        onSelect={(keys, info) => {
                            if (keys.length && onSelect) {
                                onSelect(keys[0], info.node?.data);
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default OrgUnitTree;
