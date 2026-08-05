const express = require('express');
const router = express.Router();
const Venda = require('../models/Venda');
const Despesa = require('../models/Despesa');
const FrangoCorte = require('../models/FrangoCorte');
const Poedeira = require('../models/Poedeira');
const { auth } = require('../middleware/auth');

// Dashboard - Visão Geral
router.get('/overview', auth, async (req, res) => {
  try {
    const { ano, mes, linha } = req.query;
    
    // Filtros de data
    let startDate = new Date('2025-01-01');
    let endDate = new Date('2025-12-31');
    
    if (ano) {
      startDate = new Date(`${ano}-01-01`);
      endDate = new Date(`${ano}-12-31`);
    }
    
    if (mes) {
      startDate = new Date(`${ano || 2025}-${mes}-01`);
      endDate = new Date(`${ano || 2025}-${mes}-31`);
    }

    // Receita Total
    const receitaQuery = { 
      dataVenda: { $gte: startDate, $lte: endDate },
      status: 'pago'
    };
    
    if (linha === 'frango') {
      receitaQuery.tipoProduto = 'frango';
    } else if (linha === 'ovos') {
      receitaQuery.tipoProduto = 'ovos';
    }
    
    const vendas = await Venda.find(receitaQuery);
    const receitaTotal = vendas.reduce((sum, v) => sum + v.valorTotal, 0);

    // Despesas Totais
    const despesaQuery = { 
      dataDespesa: { $gte: startDate, $lte: endDate },
      status: 'pago'
    };
    
    const despesas = await Despesa.find(despesaQuery);
    const despesaTotal = despesas.reduce((sum, d) => sum + d.valor, 0);

    // Lucro Líquido
    const lucroLiquido = receitaTotal - despesaTotal;

    // Margem de Lucro
    const margemLucro = receitaTotal > 0 ? ((lucroLiquido / receitaTotal) * 100).toFixed(2) : 0;

    // ROI Anual
    const investimentoTotal = despesas.reduce((sum, d) => sum + d.valor, 0);
    const roi = investimentoTotal > 0 ? ((lucroLiquido / investimentoTotal) * 100).toFixed(2) : 0;

    // Aves Alojadas
    const frangosAtivos = await FrangoCorte.find({ status: 'ativo' });
    const poedeirasAtivas = await Poedeira.find({ status: 'ativo' });
    
    const totalFrangos = frangosAtivos.reduce((sum, f) => sum + f.quantidade, 0);
    const totalPoedeiras = poedeirasAtivas.reduce((sum, p) => sum + p.quantidade, 0);
    const avesAlojadas = totalFrangos + totalPoedeiras;

    // Taxa de Mortalidade Média
    const taxaMortalidadeFrangos = frangosAtivos.length > 0 
      ? frangosAtivos.reduce((sum, f) => sum + f.taxaMortalidade, 0) / frangosAtivos.length 
      : 0;
    
    const taxaMortalidadePoedeiras = poedeirasAtivas.length > 0 
      ? poedeirasAtivas.reduce((sum, p) => sum + p.taxaMortalidade, 0) / poedeirasAtivas.length 
      : 0;
    
    const taxaMortalidadeMedia = ((taxaMortalidadeFrangos + taxaMortalidadePoedeiras) / 2).toFixed(2);

    // Fluxo de Caixa Líquido
    const fluxoCaixaLiquido = lucroLiquido;

    // Receita por Linha de Produto
    const vendasFrango = await Venda.find({
      ...receitaQuery,
      tipoProduto: 'frango'
    });
    const receitaFrango = vendasFrango.reduce((sum, v) => sum + v.valorTotal, 0);

    const vendasOvos = await Venda.find({
      ...receitaQuery,
      tipoProduto: 'ovos'
    });
    const receitaOvos = vendasOvos.reduce((sum, v) => sum + v.valorTotal, 0);

    // Dados para Gráficos - Receita Mensal
    const receitaMensal = [];
    for (let i = 1; i <= 12; i++) {
      const monthStart = new Date(`${ano || 2025}-${String(i).padStart(2, '0')}-01`);
      const monthEnd = new Date(`${ano || 2025}-${String(i).padStart(2, '0')}-31`);
      
      const vendasMes = await Venda.find({
        dataVenda: { $gte: monthStart, $lte: monthEnd },
        status: 'pago'
      });
      
      const receitaMes = vendasMes.reduce((sum, v) => sum + v.valorTotal, 0);
      receitaMensal.push(receitaMes);
    }

    // Dados para Gráficos - Distribuição de Despesas
    const categoriasDespesas = ['alimentacao', 'medicamentos', 'manutencao', 'salarios', 'energia', 'agua', 'outros'];
    const distribuicaoDespesas = [];
    
    for (const categoria of categoriasDespesas) {
      const despesasCategoria = await Despesa.find({
        ...despesaQuery,
        categoria
      });
      const valorCategoria = despesasCategoria.reduce((sum, d) => sum + d.valor, 0);
      distribuicaoDespesas.push(valorCategoria);
    }
    
    // Normalizar para porcentagem
    const totalDespesasCategorias = distribuicaoDespesas.reduce((sum, val) => sum + val, 0);
    const distribuicaoDespesasPercent = distribuicaoDespesas.map(val => 
      totalDespesasCategorias > 0 ? ((val / totalDespesasCategorias) * 100).toFixed(1) : 0
    );

    // Dados para Gráficos - Produção
    const producaoAtual = [
      totalFrangos,
      poedeirasAtivas.reduce((sum, p) => sum + (p.producaoDiaria || 0), 0) / 1000
    ];
    
    // Produção mês anterior (simulado)
    const producaoAnterior = [
      Math.round(totalFrangos * 0.9),
      Math.round((poedeirasAtivas.reduce((sum, p) => sum + (p.producaoDiaria || 0), 0) / 1000) * 0.95)
    ];

    // Dados para Gráficos - Mortalidade Mensal
    const mortalidadeFrangos = [];
    const mortalidadePoedeiras = [];
    
    for (let i = 1; i <= 12; i++) {
      const monthStart = new Date(`${ano || 2025}-${String(i).padStart(2, '0')}-01`);
      const monthEnd = new Date(`${ano || 2025}-${String(i).padStart(2, '0')}-31`);
      
      const frangosMes = await FrangoCorte.find({
        dataEntrada: { $gte: monthStart, $lte: monthEnd }
      });
      
      const poedeirasMes = await Poedeira.find({
        dataEntrada: { $gte: monthStart, $lte: monthEnd }
      });
      
      const taxaFrangos = frangosMes.length > 0 
        ? frangosMes.reduce((sum, f) => sum + f.taxaMortalidade, 0) / frangosMes.length 
        : 0;
      
      const taxaPoedeiras = poedeirasMes.length > 0 
        ? poedeirasMes.reduce((sum, p) => sum + p.taxaMortalidade, 0) / poedeirasMes.length 
        : 0;
      
      mortalidadeFrangos.push(taxaFrangos);
      mortalidadePoedeiras.push(taxaPoedeiras);
    }

    // Dados para Gráficos - Fluxo de Caixa
    const fluxoCaixaReceitas = [];
    const fluxoCaixaDespesas = [];
    
    for (let i = 1; i <= 12; i++) {
      const monthStart = new Date(`${ano || 2025}-${String(i).padStart(2, '0')}-01`);
      const monthEnd = new Date(`${ano || 2025}-${String(i).padStart(2, '0')}-31`);
      
      const receitasMes = await Venda.find({
        dataVenda: { $gte: monthStart, $lte: monthEnd },
        status: 'pago'
      });
      
      const despesasMes = await Despesa.find({
        dataDespesa: { $gte: monthStart, $lte: monthEnd },
        status: 'pago'
      });
      
      const totalReceitas = receitasMes.reduce((sum, v) => sum + v.valorTotal, 0);
      const totalDespesas = despesasMes.reduce((sum, d) => sum + d.valor, 0);
      
      fluxoCaixaReceitas.push(totalReceitas);
      fluxoCaixaDespesas.push(totalDespesas);
    }

    // Meta Anual (exemplo: 20% de margem)
    const metaMargem = 20;
    const desempenhoMeta = ((margemLucro / metaMargem) * 100).toFixed(2);

    // Saúde da Granja
    let saudeGranja = 'Saudável';
    if (margemLucro < 10 || taxaMortalidadeMedia > 5 || fluxoCaixaLiquido < 0) {
      saudeGranja = 'Atenção';
    }
    if (margemLucro < 5 || taxaMortalidadeMedia > 10 || fluxoCaixaLiquido < -10000) {
      saudeGranja = 'Crítico';
    }

    res.json({
      saudeGranja,
      indicadores: {
        receitaTotal,
        lucroLiquido,
        margemLucro: parseFloat(margemLucro),
        roi: parseFloat(roi),
        avesAlojadas,
        taxaMortalidadeMedia: parseFloat(taxaMortalidadeMedia),
        fluxoCaixaLiquido
      },
      desempenhoMeta: {
        metaMargem,
        desempenho: parseFloat(desempenhoMeta)
      },
      receitaPorLinha: {
        frango: receitaFrango,
        ovos: receitaOvos
      },
      resumoVendas: {
        totalVendas: vendas.length,
        valorMedioVenda: vendas.length > 0 ? receitaTotal / vendas.length : 0
      },
      // Dados para gráficos
      receitaMensal,
      distribuicaoDespesas: distribuicaoDespesasPercent,
      producao: {
        atual: producaoAtual,
        anterior: producaoAnterior
      },
      mortalidade: {
        frangos: mortalidadeFrangos,
        poedeiras: mortalidadePoedeiras
      },
      fluxoCaixa: {
        receitas: fluxoCaixaReceitas,
        despesas: fluxoCaixaDespesas
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados do dashboard', error: error.message });
  }
});

module.exports = router;
