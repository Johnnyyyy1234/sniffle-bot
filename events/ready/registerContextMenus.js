require("colors");
const { testServerId } = require("../../config.json");
const getApplicationContextMenus = require("../../utils/getApplicationCommands");
const getLocalContextMenus = require("../../utils/getLocalContextMenus");

module.exports = async (client) => {
	try {
		const localContextMenus = getLocalContextMenus();
		const applicationContextMenus = await getApplicationContextMenus(client);

		for (const localContextMenu of localContextMenus) {
			const { data } = localContextMenu;

			const contextMenuName = data.name;
			const contextMenuType = data.type;

			const existingContextMenu = await applicationContextMenus.cache.find(
				(cmd) => cmd.name === contextMenuName,
			);

			if (existingContextMenu) {
				if (localContextMenu.deleted) {
					await applicationContextMenus.delete(existingContextMenu.id);
					console.log(
						`Application command ${contextMenuName} has been deleted`.red,
					);
				}
			} else {
				if (localContextMenu.deleted) {
					console.log(
						`Application command ${contextMenuName} has been skipped, since property "deleted" is set to "true".`
							.gray,
					);
					continue;
				}

				await applicationContextMenus.create({
					name: contextMenuName,
					type: contextMenuType,
				});
				console.log(
					`Application command ${contextMenuName} has been registered.`.green,
				);
			}
		}
	} catch (error) {
		console.log(
			`[ERROR] an error occured inside the command registry:\n${error}`.red,
		);
	}
};
