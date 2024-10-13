'use strict'

var Project = require('../models/project');
var fs = require('fs');
var path = require('path');

var controller = {
	
	home: function(req, res){
		return res.status(200).send({
			message: 'Soy la home'
		});
	},

	test: function(req, res){
		return res.status(200).send({
			message: "Soy el metodo o accion test del controlador de project"
		});
	},

	saveProject: function(req, res){
		var project = new Project();

		var params = req.body;
		project.name = params.name;
		project.description = params.description;
		project.category = params.category;
		project.year = params.year;
		project.langs = params.langs;
		project.image = null;

		project.save()
		.then((projectStored) => {
			if (!projectStored) return res.status(404).send({ message: 'No se ha podido guardar el proyecto.' });

			return res.status(200).send({ project: projectStored });
		})
		.catch(err => {
			return res.status(500).send({ message: 'Error al guardar el documento.' });
		});
	},

	getProject: function(req, res) {
		var projectId = req.params.id;
	
		if (projectId == null) return res.status(404).send({ message: 'El proyecto no existe.' });
	
		Project.findById(projectId)
			.then(project => {
				if (!project) return res.status(404).send({ message: 'El proyecto no existe.' });
	
				return res.status(200).send({ project });
			})
			.catch(err => {
				return res.status(500).send({ message: 'Error al devolver los datos.' });
			});
	},
	

	getProjects: function(req, res) {
		Project.find({}).sort('-year')
			.then(projects => {
				if (!projects || projects.length === 0) {
					return res.status(404).send({ message: 'No hay proyectos que mostrar.' });
				}
				return res.status(200).send({ projects });
			})
			.catch(err => {
				return res.status(500).send({ message: 'Error al devolver los datos.' });
			});
	},
	
	updateProject: function(req, res) {
		var projectId = req.params.id;
		var update = req.body;
	
		Project.findByIdAndUpdate(projectId, update, { new: true })
			.then(projectUpdated => {
				if (!projectUpdated) {
					return res.status(404).send({ message: 'No existe el proyecto para actualizar' });
				}
				return res.status(200).send({ project: projectUpdated });
			})
			.catch(err => {
				return res.status(500).send({ message: 'Error al actualizar' });
			});
	},
	deleteProject: function(req, res) {
		var projectId = req.params.id;
	
		Project.findByIdAndRemove(projectId)
			.then(projectRemoved => {
				if (!projectRemoved) {
					return res.status(404).send({ message: "No se puede eliminar ese proyecto." });
				}
				return res.status(200).send({ project: projectRemoved });
			})
			.catch(err => {
				return res.status(500).send({ message: 'No se ha podido borrar el proyecto' });
			});
	},
	

	uploadImage: function(req, res) {
		var projectId = req.params.id;
		var fileName = 'Imagen no subida...';
	
		if (req.files) {
			var filePath = req.files.image.path;
			var fileSplit = filePath.split('\\');
			var fileName = fileSplit[1];
			var extSplit = fileName.split('.');
			var fileExt = extSplit[1];
	
			if (fileExt === 'png' || fileExt === 'jpg' || fileExt === 'jpeg' || fileExt === 'gif') {
				Project.findByIdAndUpdate(projectId, { image: fileName }, { new: true })
					.then(projectUpdated => {
						if (!projectUpdated) {
							return res.status(404).send({ message: 'El proyecto no existe y no se ha asignado la imagen' });
						}
						return res.status(200).send({ project: projectUpdated });
					})
					.catch(err => {
						return res.status(500).send({ message: 'La imagen no se ha subido' });
					});
			} else {
				fs.unlink(filePath, (err) => {
					return res.status(200).send({ message: 'La extensión no es válida' });
				});
			}
		} else {
			return res.status(200).send({ message: fileName });
		}
	},
	getImageFile: function(req, res) {
		const file = req.params.image;
		const path_file = path.resolve(__dirname, './uploads', file);
	
		fs.access(path_file, fs.constants.F_OK, (err) => {
			if (!err) {
				return res.sendFile(path_file);
			} else {
				return res.status(404).send({
					message: "No existe la imagen..."
				});
			}
		});
	}

};

module.exports = controller;