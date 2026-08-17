const User = require('../models/User');
const Noticia = require('../models/Noticia');

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@avicultura.com' });
    
    if (!adminExists) {
      const admin = await User.create({
        email: 'admin@avicultura.com',
        password: '@Admin123@',
        name: 'Administrador',
        role: 'admin'
      });
      console.log('✅ Admin user created successfully');
      return admin;
    } else {
      console.log('ℹ️ Admin user already exists');
      return adminExists;
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
};

const seedNoticias = async () => {
  try {
    const noticiasCount = await Noticia.countDocuments();
    
    if (noticiasCount === 0) {
      const noticias = [
        {
          titulo: 'Bem-vindo ao AgroProtein - Sistema de Gestão Avícola',
          conteudo: 'Estamos muito felizes em anunciar o lançamento do nosso novo sistema de gestão avícola. O AgroProtein foi desenvolvido para facilitar o controle de frangos de corte, poedeiras, vendas, despesas e muito mais. Com uma interface moderna e intuitiva, você poderá gerenciar toda a sua produção avícola de forma eficiente.',
          categoria: 'geral',
          autor: 'Administrador',
          destaque: true,
          publicado: true,
          dataPublicacao: new Date()
        },
        {
          titulo: 'Dicas para aumentar a produção de ovos',
          conteudo: 'Para aumentar a produção de ovos das suas poedeiras, é importante manter uma alimentação balanceada, garantir boa iluminação no galinheiro, manter a temperatura adequada e fornecer água limpa em abundância. Além disso, o manejo correto e a prevenção de doenças são fundamentais.',
          categoria: 'poedeiras',
          autor: 'Administrador',
          destaque: true,
          publicado: true,
          dataPublicacao: new Date()
        },
        {
          titulo: 'Controle de mortalidade em frangos de corte',
          conteudo: 'O controle de mortalidade é essencial para o sucesso da produção de frangos de corte. Mantenha registros detalhados, monitore a temperatura e umidade do aviário, forneça ração de qualidade e mantenha a higiene rigorosa. A detecção precoce de problemas pode salvar muitas aves.',
          categoria: 'frangos',
          autor: 'Administrador',
          destaque: false,
          publicado: true,
          dataPublicacao: new Date()
        }
      ];
      
      await Noticia.insertMany(noticias);
      console.log('✅ Sample news created successfully');
    } else {
      console.log('ℹ️ News already exist in database');
    }
  } catch (error) {
    console.error('❌ Error creating sample news:', error.message);
    throw error;
  }
};

module.exports = { seedAdmin, seedNoticias };
