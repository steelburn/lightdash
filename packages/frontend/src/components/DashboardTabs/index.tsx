import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import {
    type DashboardTab,
    type DashboardTile,
    type Dashboard as IDashboard,
} from '@lightdash/common';
import { ActionIcon, Group, ScrollArea, Tabs } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import cloneDeep from 'lodash/cloneDeep';
import { useMemo, useState, type FC } from 'react';
import { Responsive, WidthProvider, type Layout } from 'react-grid-layout';
import { useLocation, useNavigate } from 'react-router';
import { v4 as uuid4 } from 'uuid';
import useDashboardContext from '../../providers/Dashboard/useDashboardContext';
import { TrackSection } from '../../providers/Tracking/TrackingProvider';
import '../../styles/droppable.css';
import { SectionName } from '../../types/Events';
import EmptyStateNoTiles from '../DashboardTiles/EmptyStateNoTiles';
import MantineIcon from '../common/MantineIcon';
import { LockedDashboardModal } from '../common/modal/LockedDashboardModal';
import { TabAddModal } from './AddTabModal';
import { TabDeleteModal } from './DeleteTabModal';
import { TabEditModal } from './EditTabModal';
import GridTile from './GridTile';
import DraggableTab from './Tab';
import {
    getReactGridLayoutConfig,
    getResponsiveGridLayoutProps,
} from './gridUtils';

const ResponsiveGridLayout = WidthProvider(Responsive);

type DashboardTabsProps = {
    isEditMode: boolean;
    hasRequiredDashboardFiltersToSet: boolean;
    addingTab: boolean;
    dashboardTiles: DashboardTile[] | undefined;
    activeTab: DashboardTab | undefined;
    handleAddTiles: (tiles: IDashboard['tiles'][number][]) => Promise<void>;
    handleUpdateTiles: (layout: Layout[]) => Promise<void>;
    handleDeleteTile: (tile: IDashboard['tiles'][number]) => Promise<void>;
    handleBatchDeleteTiles: (tile: IDashboard['tiles'][number][]) => void;
    handleEditTile: (tiles: IDashboard['tiles'][number]) => void;
    setActiveTab: (
        value: React.SetStateAction<DashboardTab | undefined>,
    ) => void;
    setAddingTab: (value: React.SetStateAction<boolean>) => void;
    setGridWidth: (value: React.SetStateAction<number>) => void;
};

const DashboardTabs: FC<DashboardTabsProps> = ({
    isEditMode,
    hasRequiredDashboardFiltersToSet,
    addingTab,
    dashboardTiles,
    activeTab,
    setActiveTab,
    handleAddTiles,
    handleUpdateTiles,
    handleDeleteTile,
    handleBatchDeleteTiles,
    handleEditTile,
    setGridWidth,
    setAddingTab,
}) => {
    const layouts = useMemo(
        () => ({
            lg:
                dashboardTiles?.map<Layout>((tile) =>
                    getReactGridLayoutConfig(tile, isEditMode),
                ) ?? [],
        }),
        [dashboardTiles, isEditMode],
    );

    const { search } = useLocation();
    const navigate = useNavigate();

    const dashboardUuid = useDashboardContext((c) => c.dashboard?.uuid);
    const projectUuid = useDashboardContext((c) => c.projectUuid);
    const setHaveTabsChanged = useDashboardContext((c) => c.setHaveTabsChanged);
    const dashboardTabs = useDashboardContext((c) => c.dashboardTabs);
    const setDashboardTabs = useDashboardContext((c) => c.setDashboardTabs);

    // tabs state
    const [isEditingTab, setEditingTab] = useState<boolean>(false);
    const [isDeletingTab, setDeletingTab] = useState<boolean>(false);

    const defaultTab = dashboardTabs?.[0];
    // Context: We don't want to show the "tabs mode" if there is only one tab in state
    // This is because the tabs mode is only useful when there are multiple tabs
    const sortedTabs =
        dashboardTabs.length > 1
            ? dashboardTabs?.sort((a, b) => a.order - b.order)
            : [];
    const hasDashboardTiles = dashboardTiles && dashboardTiles.length > 0;
    const tabsEnabled = dashboardTabs && dashboardTabs.length > 1;

    const sortedTiles = dashboardTiles?.sort((a, b) => {
        if (a.y === b.y) {
            // If 'y' is the same, sort by 'x'
            return a.x - b.x;
        } else {
            // Otherwise, sort by 'y'
            return a.y - b.y;
        }
    });

    const isActiveTile = (tile: DashboardTile) => {
        const tileBelongsToActiveTab = tile.tabUuid === activeTab?.uuid; // tiles belongs to current tab
        const defaultTabOrFirstTabActived =
            activeTab?.uuid === defaultTab?.uuid ||
            activeTab?.uuid === sortedTabs?.[0]?.uuid;
        const tileHasStaleTabReference =
            !dashboardTabs?.some((tab) => tab.uuid === tile.tabUuid) &&
            defaultTabOrFirstTabActived; // tile des not belong to any tab and display it on default tab
        return (
            !tabsEnabled || tileBelongsToActiveTab || tileHasStaleTabReference
        );
    };

    const currentTabHasTiles = !!sortedTiles?.some((tile) =>
        isActiveTile(tile),
    );

    const handleAddTab = (name: string) => {
        if (name) {
            const newTabs = dashboardTabs ? [...dashboardTabs] : [];
            if (!dashboardTabs?.length) {
                const firstTab = {
                    name: 'Tab 1',
                    uuid: uuid4(),
                    isDefault: true,
                    order: 0,
                };
                newTabs.push(firstTab);
                dashboardTiles?.forEach((tile) => {
                    tile.tabUuid = firstTab.uuid; // move all tiles to default tab
                });
            }
            const lastOrd = newTabs.sort((a, b) => b.order - a.order)[0].order;
            const newTab = {
                name: name,
                uuid: uuid4(),
                isDefault: false,
                order: lastOrd + 1,
            };
            newTabs.push(newTab);
            setDashboardTabs(newTabs);
            setActiveTab(newTab);
            setHaveTabsChanged(true);
        }
        setAddingTab(false);
    };

    const handleEditTab = (name: string, changedTabUuid: string) => {
        if (name && changedTabUuid) {
            setDashboardTabs((currentTabs) => {
                const newTabs: DashboardTab[] = currentTabs?.map((tab) => {
                    if (tab.uuid === changedTabUuid) {
                        return { ...tab, name };
                    }
                    return tab;
                });
                return newTabs;
            });
            setHaveTabsChanged(true);
            setEditingTab(false);
        }
    };

    const handleDeleteTab = (tabUuid: string) => {
        setDashboardTabs((currentTabs) => {
            const newTabs: DashboardTab[] = currentTabs?.filter(
                (tab) => tab.uuid !== tabUuid,
            );
            return newTabs;
        });
        if (activeTab?.uuid === tabUuid) {
            setActiveTab(
                dashboardTabs.filter((tab) => tab.uuid !== tabUuid)?.[0],
            );
        }
        setHaveTabsChanged(true);
        setDeletingTab(false);

        if (dashboardTabs.length === 1) {
            dashboardTiles?.forEach((tile) => {
                tile.tabUuid = undefined; // set tab uuid back to null to avoid foreign key constraint error
            });
            // If this is the last tab, navigate to the non-tab URL.
            // See `const = sortedTabs` for more context.
            void navigate(
                `/projects/${projectUuid}/dashboards/${dashboardUuid}/edit`,
                { replace: true },
            );

            return;
        }

        const tilesToDelete = dashboardTiles?.filter(
            (tile) => tile.tabUuid === tabUuid,
        );
        if (tilesToDelete) {
            handleBatchDeleteTiles(tilesToDelete);
        }
    };
    const MAGIC_SCROLL_AREA_HEIGHT = 40;

    return (
        <DragDropContext
            onDragEnd={(result) => {
                if (!result.destination) {
                    return;
                }
                const newTabs = cloneDeep(sortedTabs); // avoid mutating tab objects
                const [reorderedTab] = newTabs.splice(result.source.index, 1);
                newTabs.splice(result.destination.index, 0, reorderedTab);
                newTabs.forEach((tab, idx) => {
                    tab.order = idx;
                });
                setDashboardTabs(newTabs);
                setHaveTabsChanged(true);
            }}
        >
            <Droppable droppableId="dashboard-tabs" direction="horizontal">
                {(provided) => (
                    <>
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            <Tabs
                                value={activeTab?.uuid}
                                onTabChange={(e) => {
                                    const tab = sortedTabs?.find(
                                        (t) => t.uuid === e,
                                    );
                                    if (tab) {
                                        setActiveTab(tab);
                                        const newParams = new URLSearchParams(
                                            search,
                                        );
                                        void navigate(
                                            {
                                                pathname: isEditMode
                                                    ? `/projects/${projectUuid}/dashboards/${dashboardUuid}/edit/tabs/${tab?.uuid}`
                                                    : `/projects/${projectUuid}/dashboards/${dashboardUuid}/view/tabs/${tab?.uuid}`,
                                                search: newParams.toString(),
                                            },
                                            { replace: true },
                                        );
                                    }
                                }}
                                mt={tabsEnabled ? 'sm' : 'xs'}
                                styles={{
                                    tabsList: {
                                        flexWrap: 'nowrap',
                                        height: MAGIC_SCROLL_AREA_HEIGHT - 1,
                                    },
                                }}
                                variant="outline"
                            >
                                {sortedTabs && sortedTabs?.length > 0 && (
                                    <Tabs.List bg="gray.0" px="lg">
                                        <ScrollArea
                                            type="hover"
                                            offsetScrollbars
                                            scrollHideDelay={200}
                                            variant="primary"
                                            scrollbarSize={6}
                                            h={MAGIC_SCROLL_AREA_HEIGHT}
                                            styles={{
                                                viewport: {
                                                    paddingBottom: 0,
                                                },
                                            }}
                                        >
                                            <Group
                                                noWrap
                                                styles={(theme) => ({
                                                    root: {
                                                        gap: theme.spacing.xl,
                                                    },
                                                })}
                                            >
                                                {sortedTabs?.map((tab, idx) => {
                                                    return (
                                                        <DraggableTab
                                                            key={tab.uuid}
                                                            idx={idx}
                                                            tab={tab}
                                                            isEditMode={
                                                                isEditMode
                                                            }
                                                            sortedTabs={
                                                                sortedTabs
                                                            }
                                                            currentTabHasTiles={
                                                                currentTabHasTiles
                                                            }
                                                            isActive={
                                                                activeTab?.uuid ===
                                                                tab.uuid
                                                            }
                                                            setEditingTab={
                                                                setEditingTab
                                                            }
                                                            handleDeleteTab={
                                                                handleDeleteTab
                                                            }
                                                            setDeletingTab={
                                                                setDeletingTab
                                                            }
                                                        />
                                                    );
                                                })}
                                            </Group>
                                        </ScrollArea>
                                        {provided.placeholder}
                                        {isEditMode && (
                                            <Group pl="md">
                                                <ActionIcon
                                                    size="xs"
                                                    variant="light"
                                                    color={'blue.6'}
                                                    onClick={() =>
                                                        setAddingTab(true)
                                                    }
                                                >
                                                    <MantineIcon
                                                        icon={IconPlus}
                                                    />
                                                </ActionIcon>
                                            </Group>
                                        )}
                                    </Tabs.List>
                                )}
                                <Group
                                    grow
                                    pt={tabsEnabled ? 'sm' : undefined}
                                    pb="lg"
                                    px="xs"
                                >
                                    <ResponsiveGridLayout
                                        {...getResponsiveGridLayoutProps()}
                                        className={`${
                                            hasRequiredDashboardFiltersToSet
                                                ? 'locked'
                                                : ''
                                        }`}
                                        onDragStop={handleUpdateTiles}
                                        onResizeStop={handleUpdateTiles}
                                        onWidthChange={(cw) => setGridWidth(cw)}
                                        layouts={layouts}
                                        key={
                                            activeTab?.uuid ?? defaultTab?.uuid
                                        }
                                    >
                                        {sortedTiles?.map((tile, idx) => {
                                            if (
                                                isActiveTile(tile) // If tile belongs to active tab
                                            ) {
                                                return (
                                                    <div key={tile.uuid}>
                                                        <TrackSection
                                                            name={
                                                                SectionName.DASHBOARD_TILE
                                                            }
                                                        >
                                                            <GridTile
                                                                locked={
                                                                    hasRequiredDashboardFiltersToSet
                                                                }
                                                                index={idx}
                                                                isEditMode={
                                                                    isEditMode
                                                                }
                                                                tile={tile}
                                                                onDelete={
                                                                    handleDeleteTile
                                                                }
                                                                onEdit={
                                                                    handleEditTile
                                                                }
                                                                tabs={
                                                                    dashboardTabs
                                                                }
                                                                onAddTiles={
                                                                    handleAddTiles
                                                                }
                                                            />
                                                        </TrackSection>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </ResponsiveGridLayout>
                                </Group>
                                <LockedDashboardModal
                                    opened={
                                        hasRequiredDashboardFiltersToSet &&
                                        !!hasDashboardTiles
                                    }
                                />
                                {(!hasDashboardTiles ||
                                    !currentTabHasTiles) && (
                                    <EmptyStateNoTiles
                                        onAddTiles={handleAddTiles}
                                        emptyContainerType={
                                            dashboardTabs &&
                                            dashboardTabs.length
                                                ? 'tab'
                                                : 'dashboard'
                                        }
                                        isEditMode={isEditMode}
                                        setAddingTab={setAddingTab}
                                        activeTabUuid={activeTab?.uuid}
                                        dashboardTabs={dashboardTabs}
                                    />
                                )}
                                <TabAddModal
                                    onClose={() => setAddingTab(false)}
                                    opened={addingTab}
                                    onConfirm={(name) => {
                                        handleAddTab(name);
                                    }}
                                />
                                {activeTab && (
                                    <>
                                        <TabEditModal
                                            tab={activeTab}
                                            onClose={() => setEditingTab(false)}
                                            opened={isEditingTab}
                                            onConfirm={(name, uuid) => {
                                                handleEditTab(name, uuid);
                                            }}
                                        />
                                        <TabDeleteModal
                                            tab={activeTab}
                                            dashboardTiles={dashboardTiles}
                                            dashboardTabs={dashboardTabs}
                                            onClose={() =>
                                                setDeletingTab(false)
                                            }
                                            opened={
                                                isDeletingTab &&
                                                dashboardTabs?.length > 1
                                            }
                                            onDeleteTab={(uuid) => {
                                                handleDeleteTab(uuid);
                                            }}
                                            onMoveTile={handleEditTile}
                                        />
                                    </>
                                )}
                            </Tabs>
                        </div>
                    </>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default DashboardTabs;
